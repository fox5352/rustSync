import { readDir, BaseDirectory } from "@tauri-apps/plugin-fs";

export function getStorageItem(key: string): string | null {
  return localStorage.getItem(key) ? localStorage.getItem(key) : null;
}

export function writeStorageItem(key: string, value: string) {
  localStorage.setItem(key, value);
}

// ---------------------------------- tauri fs utils ----------------------------------
