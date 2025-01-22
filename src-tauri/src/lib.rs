use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_opener::init())
    .setup(|_app| {
        let sidecar_command = _app.shell().sidecar("server").expect("Failed to initialize sidecar command");

        let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");

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
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
