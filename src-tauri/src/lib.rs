use reqwest::Client;
use serde_json::Value;

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};
use tauri_plugin_shell::process::{Command, CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

use tauri::{Manager, State, WindowEvent};

use std::io::{Error, ErrorKind};
use std::net::UdpSocket;

use std::sync::{mpsc, Arc, Mutex};
use std::thread::{self, JoinHandle};

use uuid::Uuid;

struct Session {
    token: String,
    server_state: Arc<Mutex<SidecarState>>,
}

#[derive(Clone)]
enum ServerActions {
    StartSidecar,
    StopSidecar,
}

#[derive(Default)]
struct SidecarState {
    is_live: bool,
    child: Option<CommandChild>,
    sender: Option<mpsc::Sender<ServerActions>>,
}

fn get_ipv4_addr() -> Option<String> {
    // We create a UDP socket and "connect" it to a public IP.
    // We don't actually send any packets - this just helps us
    // determine which local interface would be used.
    let socket = match UdpSocket::bind("0.0.0.0:0") {
        Ok(socket) => socket,
        Err(e) => {
            eprintln!("error in get_server_address while binding address {}", e);
            return None;
        }
    };
    // Google's DNS server - we don't actually connect to it
    match socket.connect("8.8.8.8:80") {
        Ok(()) => (),
        Err(e) => {
            eprintln!("error in get_server_address while binding address {}", e);
            return None;
        }
    };

    // Get the local address the socket would use
    let local_addr = match socket.local_addr() {
        Ok(addr) => addr,
        Err(e) => {
            eprintln!("error in get_server_address while binding address {}", e);
            return None;
        }
    };

    return Some(local_addr.ip().to_string());
}

#[tauri::command]
fn toggle_server(state: State<'_, Mutex<Session>>) -> Result<bool, String> {
    let session = match state.lock() {
        Ok(data) => data,
        Err(error) => {
            eprintln!("error in toggle_server while locking session {}", error);
            return Err(error.to_string());
        }
    };

    let mut server_state = match session.server_state.lock() {
        Ok(data) => data,
        Err(error) => {
            eprintln!(
                "error in toggle_server while locking server state {}",
                error
            );
            return Err(error.to_string());
        }
    };

    if server_state.is_live {
        server_state
            .sender
            .as_ref()
            .unwrap()
            .send(ServerActions::StopSidecar)
            .unwrap();
        server_state.is_live = false;
        return Ok(false);
    } else {
        server_state
            .sender
            .as_ref()
            .unwrap()
            .send(ServerActions::StartSidecar)
            .unwrap();
        server_state.is_live = true;
        return Ok(true);
    }
}

#[tauri::command]
fn get_server_status(state: State<'_, Mutex<Session>>) -> Result<bool, String> {
    let session = match state.lock() {
        Ok(data) => data,
        Err(error) => {
            eprintln!("error in get_server_status while locking session {}", error);
            return Err(error.to_string());
        }
    };

    let server_state = match session.server_state.lock() {
        Ok(data) => data,
        Err(error) => {
            eprintln!(
                "error in get_server_status while locking server state {}",
                error
            );
            return Err(error.to_string());
        }
    };

    return Ok(server_state.is_live);
}

#[tauri::command]
fn get_server_address(state: State<'_, Mutex<Session>>) -> Option<String> {
    let session = match state.lock() {
        Ok(data) => Some(data),
        _ => None,
    };

    if let Some(session) = session {
        let addr = get_ipv4_addr();

        if let Some(addr) = addr {
            let url = format!("http://{}:9090?token={}", addr, session.token);

            return Some(url);
        }
    }

    return None;
}

// requests
#[tauri::command]
async fn fetch(
    state: State<'_, Mutex<Session>>,
    url: &str,
    method: &str,
    token: &str,
    body: Option<String>,
) -> Result<String, String> {
    let ip_addr_and_query = get_server_address(state).unwrap(); //.split("?").collect::<Vec<&str>>()[0];

    let ip_addr = ip_addr_and_query.split("?").collect::<Vec<&str>>()[0];

    let url = format!("{}/{}", ip_addr, url);

    let client = Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("Failed to create client: {}", e.to_string()))?;

    let request_builder = (match method.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "POST" => {
            if let Some(data) = body {
                client.post(&url).body(data)
            } else {
                client.post(&url)
            }
        }
        _ => client.get(&url),
    })
    .bearer_auth(token)
    .header("Content-Type", "application/json");

    let request = request_builder
        .build()
        .map_err(|e| format!("Failed to build request: {}", e.to_string()))?;

    let res = client
        .execute(request)
        .await
        .map_err(|e| format!("Failed to execute request: {}", e.to_string()))?;

    let json: Value = match res.json().await {
        Ok(json) => json,
        Err(e) => {
            return Err(format!(
                "Failed to parse to JSON {}:{}:{}",
                url,
                method,
                e.to_string()
            ))
        }
    };

    let json_string = match serde_json::to_string(&json) {
        Ok(json_string) => json_string,
        Err(e) => {
            return Err(format!(
                "Failed to convert to json string {}:{}:{}",
                url,
                method,
                e.to_string()
            ))
        }
    };

    return Ok(json_string);

    // Ok("".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // ----------------------- sidecar state initialize  -----------------------
    let (rx, tx) = mpsc::channel::<ServerActions>();

    let main_sidecar_state: Arc<Mutex<SidecarState>> = Arc::new(Mutex::new(SidecarState {
        is_live: false,
        child: None,
        sender: Some(rx),
    }));
    let session_sidecar_state = Arc::clone(&main_sidecar_state);
    let starter_sidecar_state = Arc::clone(&main_sidecar_state);
    let cleanup_sidecar_state = Arc::clone(&main_sidecar_state);
    let sidecar_state = Arc::clone(&main_sidecar_state);

    // ----------------------- session state initialize  -----------------------
    let _uuid = Uuid::new_v4();

    let session_state: Mutex<Session> = Mutex::new(Session {
        token: _uuid.to_string().clone(),
        server_state: session_sidecar_state,
    });

    //----------------------- thread state initialize  -----------------------
    let _sidecar_thread: Option<JoinHandle<()>> = None;

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(session_state)
        .setup(move |_app| {
            let app = _app.handle().clone();

             #[cfg(desktop)]
            let _ = app.app_handle().plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, Some(vec!["--flag1", "--flag2"]) /* arbitrary number of args to pass to your app */));
            

            // tray icon menu
            let show_i = MenuItem::with_id(_app, "show", "Show", true, None::<&str>)?;

            let hide_i = MenuItem::with_id(_app, "hide", "Hide", true, None::<&str>)?;

            let quit_i = MenuItem::with_id(_app, "quit", "Quit", true, None::<&str>)?;

            let tray_menu = Menu::with_items(_app, &[&show_i, &hide_i, &quit_i])?;

            let _ = TrayIconBuilder::new()
                .menu(&tray_menu)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|_app, event| match event.id.as_ref() {
                    "quit" => {
                        _app.exit(0);
                    }
                    "show" => {
                        _app.get_webview_window("main").unwrap().show().unwrap();
                    }
                    "hide" => {
                        _app.get_webview_window("main").unwrap().hide().unwrap();
                    }
                    _ => {
                        eprintln!("event not recognized");
                    }
                })
                .show_menu_on_left_click(false)
                .build(_app)?;

            // server sidecar spawner
            thread::spawn(move || {
                loop {
                    // Create the sidecar command.
                    let sidecar_command: Command = app
                        .shell()
                        .sidecar("server")
                        .map_err(|_| {
                            Error::new(ErrorKind::Other, "failed to create sidecar".to_string())
                        })
                        .unwrap();

                    let mut sidecar_state = sidecar_state
                        .lock()
                        .expect("sidecar thread failed to lock state");

                    match tx.try_recv() {
                        Ok(msg) => match msg {
                            ServerActions::StartSidecar => {
                                // start server

                                let (mut rx, _child) = sidecar_command
                                    .env("TOKEN", _uuid.to_string())
                                    .spawn()
                                    .map_err(|_| {
                                        Error::new(
                                            ErrorKind::Other,
                                            "failed to spawn sidecar".to_string(),
                                        )
                                    })
                                    .expect("failed to spawn sidecar");

                                sidecar_state.is_live = true;
                                sidecar_state.child = Some(_child);

                                tauri::async_runtime::spawn(async move {
                                    while let Some(event) = rx.recv().await {
                                        // if let CommandEvent::Stdout(line_bytes) = event
                                        match event {
                                            CommandEvent::Stdout(line_bytes) => {
                                                let line = String::from_utf8_lossy(&line_bytes);
                                                println!("{}", line);
                                            }
                                            CommandEvent::Stderr(line_bytes) => {
                                                let line = String::from_utf8_lossy(&line_bytes);
                                                eprintln!("{}", line);
                                            }
                                            _ => {}
                                        }
                                    }
                                });
                            }
                            ServerActions::StopSidecar => {
                                // stop server
                                if let Some(child) = sidecar_state.child.take() {
                                    child.kill().expect("failed to kill sidecar");
                                }
                                sidecar_state.is_live = false;
                            }
                        },
                        _ => (),
                    };

                    // Drop the lock before sleeping
                    drop(sidecar_state);
                    thread::sleep(std::time::Duration::from_millis(500));
                }

                //// Spawn the sidecar and get a receiver for its output.
                //
            });

            // start server
            if let Some(sender) = starter_sidecar_state.lock().unwrap().sender.as_ref() {
                sender.send(ServerActions::StartSidecar).unwrap();
            }

            // close window
            let window = _app.get_webview_window("main").unwrap();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { .. } = event {
                    if let Some(child) = cleanup_sidecar_state.lock().unwrap().child.take() {
                        child.kill().expect("failed to kill sidecar");
                    }
                }
            });

            // open devtools in debug build automagiclly
            #[cfg(debug_assertions)]
            {
                window.open_devtools();
            }

            return Ok(());
        })
        .invoke_handler(tauri::generate_handler![
            get_server_address,
            toggle_server,
            get_server_status,
            fetch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
