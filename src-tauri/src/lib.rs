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
    EndServer,
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
            eprintln!("error in toggle_server while locking server state {}", error);
            return Err(error.to_string());
        }
    };

    if server_state.is_live {
        server_state.sender.as_ref().unwrap().send(ServerActions::StopSidecar).unwrap();
        server_state.is_live = false;
        return Ok(false);
    }else {
        server_state.sender.as_ref().unwrap().send(ServerActions::StartSidecar).unwrap();
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
            eprintln!("error in get_server_status while locking server state {}", error);
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

    // ----------------------- thread state initialize  -----------------------
    let _sidecar_thread: Option<JoinHandle<()>> = None;

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(session_state)
        .setup(move |_app| {
            let app = _app.handle().clone();

            thread::spawn(move || {
                'sidecar_check_loop: loop {
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
                            ServerActions::EndServer => {
                                if let Some(child) = sidecar_state.child.take() {
                                    child.kill().expect("failed to kill sidecar");
                                }
                                sidecar_state.is_live = false;
                                break 'sidecar_check_loop;
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

            if let Some(sender) = starter_sidecar_state.lock().unwrap().sender.as_ref() {
                sender.send(ServerActions::StartSidecar).unwrap();
            }

            let window = _app.get_webview_window("main").unwrap();

            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { .. } = event {
                    if let Some(sender) = cleanup_sidecar_state.lock().unwrap().sender.as_ref() {
                        sender.send(ServerActions::EndServer).unwrap();
                    }
                    // TODO:add thread clean up later
                }
            });

            return Ok(());
        })
        .invoke_handler(tauri::generate_handler![get_server_address, toggle_server, get_server_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
