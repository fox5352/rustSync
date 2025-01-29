use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::{CommandEvent,Command};

use std::io::{Error, ErrorKind};

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
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
