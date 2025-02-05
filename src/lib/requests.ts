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
  // const res: string | null = await invoke("get_server_address");
  const res = "http://localhost:9090?token=testing";

  if (!res) throw new Error("Failed to get res from backend");

  const [addr, token] = res.split("?");

  if (!addr) throw new Error("server address not found in storage");
  if (!token) throw new Error("token not found in storage");

  return [addr, token];
}

/**
 * Perform a request to the backend.
 *
 * @param url The URL path of the request
 * @param method The HTTP method of the request
 * @param body The body of the request. Must be defined for POST requests.
 *
 * @returns A promise that resolves to the response object
 *
 * @throws If getSessionData() fails
 * @throws If the request method is POST and no body is given
 */
async function request(
  url: string,
  method: "GET" | "POST" | "PUT",
  body?: string
) {
  const [addr, query] = await getSessionData();
  const token = query.split("=")[1];
  if (!addr || !token)
    throw new Error("failed to get session data from backend");

  if (method == "POST" && (body == undefined || body == null))
    throw new Error("Can't do a post request without a body");

  let options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body,
  };

  const res = await fetch(`${addr}/${url}`, options);

  console.log(res);

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
  const res = await request(
    "api/settings",
    "POST",
    JSON.stringify({ settings: updateData })
  );

  if (!res.ok)
    throw new Error(`failed to request ${res.status}:${res.statusText}`);

  if (rvop) {
    const newSettings = await res.json();

    return newSettings;
  } else {
    return null;
  }
}
