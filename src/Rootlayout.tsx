import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { writeStorageItem } from "./lib/storageManager.tsx"

import { Outlet } from "react-router-dom";

import Navbar from "./ui/Navbar";
import { Container } from "@mui/material";

export default function Rootlayout() {

  useEffect(() => {
    (async () => {
      const res: string | null = await invoke("get_server_address");

      if (res) {
        const [addr, query] = res.split("?");

        const token = query.split("=")[1];

        writeStorageItem("serverAddress", addr);
        writeStorageItem("token", token);
      }
    })();
  }, []);


  return (
    <>
      <Navbar />
      <Container maxWidth="lg" component="main">
        <Outlet />
      </Container>
    </>
  );
}
