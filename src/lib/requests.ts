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

  const [addr, searchParams] = res.split("?");

  const token = new URLSearchParams(searchParams).get("token");

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
  const [addr, token] = await getSessionData();

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

[
  {
    key: "C:\\Users\\fox5352\\Music",
    "C:\\Users\\fox5352\\Music": [],
  },
  {
    key: "C:\\Users\\fox5352\\Music\\New folder",
    "C:\\Users\\fox5352\\Music\\New folder": [
      {
        name: "tseting - Copy (2)",
        path: "C:\\Users\\fox5352\\Music\\New folder\\tseting - Copy (2).mp3",
        extension: ".mp3",
      },
      {
        name: "tseting - Copy (3)",
        path: "C:\\Users\\fox5352\\Music\\New folder\\tseting - Copy (3).mp3",
        extension: ".mp3",
      },
      {
        name: "tseting - Copy (4)",
        path: "C:\\Users\\fox5352\\Music\\New folder\\tseting - Copy (4).mp3",
        extension: ".mp3",
      },
      {
        name: "tseting - Copy (5)",
        path: "C:\\Users\\fox5352\\Music\\New folder\\tseting - Copy (5).mp3",
        extension: ".mp3",
      },
      {
        name: "tseting - Copy (6)",
        path: "C:\\Users\\fox5352\\Music\\New folder\\tseting - Copy (6).mp3",
        extension: ".mp3",
      },
      {
        name: "tseting - Copy (7)",
        path: "C:\\Users\\fox5352\\Music\\New folder\\tseting - Copy (7).mp3",
        extension: ".mp3",
      },
      {
        name: "tseting - Copy",
        path: "C:\\Users\\fox5352\\Music\\New folder\\tseting - Copy.mp3",
        extension: ".mp3",
      },
      {
        name: "tseting",
        path: "C:\\Users\\fox5352\\Music\\New folder\\tseting.mp3",
        extension: ".mp3",
      },
    ],
  },
];

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
  type: string
): Promise<[{ data: T; message: string } | null, string | null]> {
  const res = await request(`api/${type}`, "GET");

  if (!res.ok) {
    return [
      null,
      `failed to request files type:${type}::${res.status}:${res.statusText}`,
    ];
  }

  const data = await res.json();

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
