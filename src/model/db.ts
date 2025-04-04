import Database from "@tauri-apps/plugin-sql";

export async function connect(name: string): Promise<Database> {
  const da = await Database.load(name);

  return da;
}

export function disconnect(db: Database) {
  db.close();
}
