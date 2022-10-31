#[cfg(target_os = "macos")]
mod mac;

use tauri::{App, Manager};
use window_shadows::set_shadow;
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};

// setup
pub fn init(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let window = app.get_window("main").unwrap();


    #[cfg(target_os = "macos")]
    {
        mac::set_transparent_titlebar(&window, true, false);
        set_shadow(&window, true).expect("Unsupported platform!");
        apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
            .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
    }

    #[cfg(target_os = "windows")]
    {
        window.set_decorations(false);
        set_shadow(&window, true).expect("Unsupported platform!");
        apply_blur(&window, Some((18, 18, 18, 125)))
            .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
    }

    #[cfg(target_os = "linux")]
    {
        window.set_decorations(false);
    }


    Ok(())
}
