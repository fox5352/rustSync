import Database from "@tauri-apps/plugin-sql";
import { connect } from "./db";

const DATABASE_NAME = "sqlite:settings.db";

export interface AppSettings {
  autoStart: boolean;
}

function createTable(db: Database) {
  db.execute(
    `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        autoStart BOOLEAN DEFAULT FALSE
    );`
  );
}

export async function getAppSettings(): Promise<AppSettings | null> {
  let db: Database | null = null;
  try {
    db = await connect(DATABASE_NAME);
    createTable(db);

    const data = await db.select<AppSettings[]>(
      "SELECT * FROM settings WHERE id = 1"
    );

    return {
      autoStart: Boolean(data[0].autoStart),
    };
  } catch (error) {
    console.error("Failed to get settings:", error);
    return null;
  }
}

export enum AppSettingsKeys {
  AUTO_START = "autoStart",
}

export async function updateAppSettings(field: AppSettingsKeys, value: any) {
  let db: Database | null = null;
  try {
    db = await connect(DATABASE_NAME);
    createTable(db);

    await db.execute(`UPDATE settings SET ${field} = ${value} WHERE id = 1`, [
      false,
    ]);

    return true;
  } catch (error) {
    console.error("Failed to update settings:", error);
    return false;
  }
}

export async function initializeAppSettings() {
  let db: Database | null = null;
  try {
    db = await connect(DATABASE_NAME);
    createTable(db);

    const res = await getAppSettings();

    if (res) return;

    await db.execute("INSERT INTO settings (autoStart) VALUES ($1)", [
      1,
      false,
    ]);
  } catch (error) {
    console.error("Failed to initialize settings:", error);
  }
}
