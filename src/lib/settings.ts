import {
  AppSettings,
  getAppSettings,
  initializeAppSettings,
} from "../model/settings.model";

import { isEnabled, disable, enable } from "@tauri-apps/plugin-autostart";

async function autoStart(settings: AppSettings) {
  const res = await isEnabled();
  if (settings.autoStart) {
    if (!res) await enable();
  } else {
    if (res) await disable();
  }
}

export async function manageAppSettings() {
  try {
    await initializeAppSettings();
    const settings = await getAppSettings();

    if (!settings) throw new Error("Failed to get settings");

    autoStart(settings);
  } catch (error) {
    console.error("Failed to manage app settings:", error);
  }
}
