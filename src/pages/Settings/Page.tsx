import { useEffect, useState } from "react";
import { StateError } from "../../type";

import { getStorageItem } from "../../lib/storageManager";

export default function Settings() {
  const [isError, setIsError] = useState<StateError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // const serverAddr = "http://localhost:9090";
        // const token = "testing";
        const serverAddr = getStorageItem("serverAddress");
        const token = getStorageItem("token");

        if (!serverAddr || !token)
          throw new Error("failed to get server address=error");
        // TODO: get setting from sidecar

        const url = `${serverAddr}/api/settings`;
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${token}`);

        const options = {
          method: "GET",
          headers,
        };
        console.log(options);

        const res = await fetch(url, options);
        //
        if (!res.ok)
          throw new Error(`failed to fetch settings from server=error`);
        //
        const data = await res.json();
        //
        console.log(data);
      } catch (e: any) {
        const [message, code] = e.message.split("=");
        setIsError({
          message,
          colorCode: code,
        } as StateError);
      }
    };

    fetchSettings();
  }, []);

  return <div></div>;
}
