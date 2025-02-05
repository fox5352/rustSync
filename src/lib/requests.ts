import { invoke } from "@tauri-apps/api/core";

export type AllowLst = {
  allowList: string[];
};
export type ImagePaths = {
  imagePaths: string[];
};
export type AudioPaths = {
  audioPaths: string[];
};
export type ImageExt = {
  imageExt: string[];
};
export type AudioExt = {
  audioExt: string[];
};
export type Server = {
  server: {
    host: string;
    port: number;
  };
};

export type Settings = AllowLst &
  ImagePaths &
  AudioPaths &
  ImageExt &
  AudioExt &
  Server;

export type SettingsKeys =
  | "allowList"
  | "imagePaths"
  | "audioPaths"
  | "imageExt"
  | "audioExt"
  | "server";

export async function getSessionData(): Promise<[string, string]> {
  const res: string | null = await invoke("get_server_address");

  if (!res) throw new Error("Failed to get res from backend");

  const [addr, token] = res.split("?");

  if (!addr) throw new Error("server address not found in storage");
  if (!token) throw new Error("token not found in storage");

  return [addr, token];
}

async function request(
  url: string,
  method: "GET" | "POST" | "PUT",
  body?: any
) {
  const [addr, query] = await getSessionData();

  const token = query.split("=")[1];

  if (!addr || !token)
    throw new Error("failed to get session data from backend");

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  let options = {
    method,
    headers,
    body,
  };

  if (method == "POST" && !body)
    throw new Error("Can't do a post request without a body");

  const res = await fetch(`${addr}/${url}`, options);

  return res;
}

export async function getSettings(): Promise<Settings> {
  const res = await request("api/settings", "GET");

  if (!res.ok)
    throw new Error(`failed to request ${res.status}:${res.statusText}`);

  const data = await res.json();

  return data.data.settings as Settings;
}

export async function updateSettings(
  updateData: unknown,
  rvop: boolean = false
) {
  const res = await request("api/settings", "PUT", { settings: updateData });

  if (!res.ok)
    throw new Error(`failed to request ${res.status}:${res.statusText}`);

  if (rvop) {
    const newSettings = await getSettings();

    return newSettings;
  } else {
    return null;
  }
}
