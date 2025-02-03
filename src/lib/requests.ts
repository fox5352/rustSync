import { getStorageItem } from "./storageManager"


export type AllowLst = {
  allowList: string[]
};
export type ImagePaths = {
  imagePaths: string[];
}
export type AudioPaths = {
  audioPaths: string[];
}
export type ImageExt = {
  imageExt: string[];
}
export type AudioExt = {
  audioExt: string[];
}
export type Server = {
  server: {
    host: string,
    port: number,
  }
}

export type Settings = AllowLst & ImagePaths & AudioPaths & ImageExt & AudioExt & Server;

export type SettingsKeys = "allowList" | "imagePaths" | "audioPaths" | "imageExt" | "audioExt" | "server";

export function getSessionData(): [string, string] {
  const addr = getStorageItem("serverAddress");

  if (!addr) throw new Error("server address not found in storage");

  const token = getStorageItem("token")

  if (!token) throw new Error("token not found in storage");

  return [addr, token];
}


async function request(url: string, method: "GET" | "POST" | "PUT", body?: any) {
  const [addr, token] = getSessionData();

  if (!addr || !token) throw new Error("failed to get session data from backend");

  console.log(addr, token)

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  let options = {
    method,
    headers,
    body
  };

  if (method == "POST" && !body) throw new Error("Can't do a post request without a body");

  const res = await fetch(`${addr}/${url}`, options);

  return res
}

export async function getSettings(): Promise<Settings> {
  const res = await request("api/settings", "GET");

  if (!res.ok) throw new Error(`failed to request ${res.status}:${res.statusText}`);

  const data = await res.json();

  return data.data.settings as Settings
}

export async function updateSettings(updateData: unknown, rvop: boolean = false) {
  const res = await request("api/settings", "PUT", { settings: updateData });

  if (!res.ok) throw new Error(`failed to request ${res.status}:${res.statusText}`);

  if (rvop) {
    const newSettings = await getSettings();

    return newSettings
  } else {
    return null
  }
}
