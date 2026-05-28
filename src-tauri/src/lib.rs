use std::{
  net::TcpStream,
  process::{Child, Command, Stdio},
  sync::Mutex,
  thread,
  time::{Duration, Instant},
};

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

struct NextServer(Mutex<Option<Child>>);

fn wait_for_server(port: u16) -> Result<(), String> {
  let started_at = Instant::now();

  while started_at.elapsed() < Duration::from_secs(30) {
    if TcpStream::connect(("127.0.0.1", port)).is_ok() {
      return Ok(());
    }

    thread::sleep(Duration::from_millis(250));
  }

  Err(format!("Next server did not start on port {port}"))
}

fn start_next_server(app: &tauri::App) -> Result<Option<Child>, String> {
  if cfg!(debug_assertions) {
    return Ok(None);
  }

  let resource_dir = app.path().resource_dir().map_err(|error| error.to_string())?;
  let next_dir = resource_dir.join("next");
  let server_js = next_dir.join("server.js");

  if !server_js.exists() {
    return Err(format!(
      "Next server was not bundled at {}",
      server_js.display()
    ));
  }

  let child = Command::new("node")
    .arg("server.js")
    .current_dir(next_dir)
    .env("NODE_ENV", "production")
    .env("HOSTNAME", "127.0.0.1")
    .env("PORT", "3000")
    .stdin(Stdio::null())
    .stdout(Stdio::null())
    .stderr(Stdio::null())
    .spawn()
    .map_err(|error| format!("Failed to start bundled Next server: {error}"))?;

  wait_for_server(3000)?;

  Ok(Some(child))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
          .build(),
        )?;
      }

      let next_server = start_next_server(app)?;
      app.manage(NextServer(Mutex::new(next_server)));

      WebviewWindowBuilder::new(
        app,
        "main",
        WebviewUrl::External("http://127.0.0.1:3000".parse().unwrap()),
      )
      .title("Rise")
      .inner_size(1440.0, 900.0)
      .resizable(true)
      .build()?;

      Ok(())
    })
    .on_window_event(|window, event| {
      if matches!(event, tauri::WindowEvent::Destroyed) {
        if let Some(state) = window.try_state::<NextServer>() {
          if let Ok(mut child) = state.0.lock() {
            if let Some(mut child) = child.take() {
              let _ = child.kill();
            }
          }
        }
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
