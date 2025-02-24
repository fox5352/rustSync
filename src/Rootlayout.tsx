import { Outlet } from "react-router-dom";

import Navbar from "./ui/Navbar";
import { Container, Typography } from "@mui/material";
import { useSession } from "./store/session";
import { useEffect, useState } from "react";
import { getSessionData } from "./lib/requests";

export default function Rootlayout() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const { setSession } = useSession();


  useEffect(() => {
    const manageSession = async () => {
      try {
        setIsLoadingSession(true);
        const [url, token] = await getSessionData();

        if (!url || !token) throw new Error("Invalid session data");

        setSession({ url, token });

      } catch (err) {
        console.error("Failed to manage session:", err);
      } finally {
        setIsLoadingSession(false);
      }
    }

    manageSession();
  }, [])

  return (
    <>
      <Navbar />
      {
        isLoadingSession ? (
          <Typography variant="h4" component="h3">loading...</Typography>)
          : (
            <Container
              maxWidth="xl"
              component="main"
              sx={{ height: "100vh", overflowY: "scroll", pb: 12 }}
            >
              <Outlet />
            </Container>)
      }
    </>
  );
}
