import { invoke } from "@tauri-apps/api/core";
import { Session } from "../store/session";

export type AllowLst = {
  allowList: string[];
};
export type ImagePaths = {
  imagePaths: string[];
};
export type AudioPaths = {
  audioPaths: string[];
};

export type VideoPaths = {
  videoPaths: string[];
};

export type ImageExt = {
  imageExt: string[];
};
export type AudioExt = {
  audioExt: string[];
};

export type VideoExt = {
  videoExt: string[];
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
  VideoPaths &
  ImageExt &
  AudioExt &
  VideoExt &
  Server;

export type SettingsKeys =
  | "allowList"
  | "imagePaths"
  | "audioPaths"
  | "videoPaths"
  | "imageExt"
  | "audioExt"
  | "videoExt"
  | "server";

export async function getSessionData(): Promise<[string, string]> {
  const res: string | null = await invoke("get_server_address");

  if (!res) throw new Error("Failed to get res from backend");

  const [addr, searchParams] = res.split("?");

  const token = new URLSearchParams(searchParams).get("token");

  if (!addr) throw new Error("server address not found in storage");
  if (!token) throw new Error("token not found in storage");

  return [addr, token.trim()];
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
  session: Session,
  body?: string
): Promise<string> {
  if (method == "POST" && (body == undefined || body == null))
    throw new Error("Can't do a post request without a body");

  const res = await invoke<string>("fetch", {
    url,
    method,
    token: session.token,
    body,
  });

  // const headers = new Headers();
  // headers.append("Authorization", session.token);
  // headers.append("Content-Type", "application/json");

  // let options = {
  //   method,
  //   headers,
  //   body: body,
  // };

  // const res = await fetch(`${session.url}/${url}`, options);

  return res;
}

export async function getSettings(session: Session): Promise<Settings> {
  const res = await request("api/settings", "GET", session);

  const data = await JSON.parse(res);

  return data.data.settings as Settings;
}

export async function updateSettings(
  updateData: unknown,
  session: Session,
  rvop: boolean = false
): Promise<Settings | null> {
  const res = await request(
    "api/settings",
    "POST",
    session,
    JSON.stringify({ settings: updateData })
  );

  if (rvop) {
    const newSettings = await JSON.parse(res);

    return newSettings.data.settings;
  } else {
    return null;
  }
}

export interface File {
  name: string;
  path: string;
  extension: string;
}

export interface Folder {
  [key: string]: File[];
}

export interface FileData {
  key: string;
  folder: Folder;
}

export async function getFiles<T>(
  type: string,
  session: Session
): Promise<[{ data: T; message: string } | null, string | null]> {
  const res = await request(`api/${type}`, "GET", session);

  // if (!res.ok) {
  //   return [
  //     null,
  //     `failed to request files type:${type}::${res.status}:${res.statusText}`,
  //   ];
  // }

  const data = JSON.parse(res);

  return [data as { data: T; message: string }, null];
}

// ---------------------------------------- tauri invoke calls ----------------------------------------
export async function toggleServerState(): Promise<boolean | null> {
  return await invoke<boolean>("toggle_server").catch((error) => {
    console.error("failed on toggleServerState ", error);
    return null;
  });
}

export async function getServerStatus(): Promise<boolean | null> {
  return await invoke<boolean>("get_server_status").catch((error) => {
    console.error("failed on getServerStatus", error);
    return null;
  });
}
