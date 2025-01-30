use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::{CommandEvent,Command};

use std::io::{Error, ErrorKind};
use std::net::UdpSocket;

#[tauri::command]
fn get_server_address() -> Option<String> {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_opener::init())
    .setup(move |_app| {
        let sidecar_command: Command = _app
            .shell()
            .sidecar("server")
            .map_err(|_| { 
                Error::new( 
                    ErrorKind::Other,
                    "failed to create sidecar".to_string()
                )
            })?;

        let (mut rx, _child) = sidecar_command
            .spawn()
            .map_err(|_| { 
            Error::new( 
                ErrorKind::Other,
                "failed to spawn sidecar".to_string()
            )
            })?;

        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                // if let CommandEvent::Stdout(line_bytes) = event 
                match event {
                    CommandEvent::Stdout(line_bytes) => {
                        let line = String::from_utf8_lossy(&line_bytes);
                        println!("{}", line);
                    },
                    CommandEvent::Stderr(line_bytes) => {
                        let line = String::from_utf8_lossy(&line_bytes);
                        eprintln!("{}", line);
                    },
                    _=>{}
                }
            }
        });
        
        return Ok(());
    })
    .invoke_handler(tauri::generate_handler![get_server_address])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
