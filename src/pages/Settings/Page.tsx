import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from "@mui/material";

import { StateError } from "../../type";

import ViewBox from "./ui/ViewBox";
import {
  getServerStatus,
  getSettings,
  Settings,
  SettingsKeys,
  toggleServerState,
  updateSettings,
} from "../../lib/requests";
import InputBox from "./ui/InputBox";

export default function SettingsPage() {
  const [isServerLive, setIsServerLive] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isError, setIsError] = useState<StateError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateFunction = async (key: SettingsKeys, list: string[]) => {
    const data = {
      [key]: list,
    };

    try {
      const settings = await updateSettings(data, true);
      setSettings(settings);
    } catch (e) {
      console.error("Failed to update settings:", e);
      setIsError({
        message: "Failed to update settings",
        colorCode: "error",
      } as StateError);
    }
  };

  const toggleServer = async () => {
    const res = await toggleServerState();

    if (res == null) return;

    setIsServerLive(res);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isServerLive) return;
      console.log(`server state ${isServerLive}`);

      try {
        setIsLoading(true);
        setIsError(null);

        const settings = await getSettings();

        setSettings(settings);
      } catch (e: any) {
        console.error("Failed to fetch settings:", e);
        setIsError({
          message: e.message,
          colorCode: "error",
        } as StateError);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [isServerLive]);

  useEffect(() => {
    getServerStatus().then((res) => {
      if (res == null) return;

      setIsServerLive(res);
    });
  }, []);

  return (
    <>
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          flexGrow: 1,
          p: 2,
          my: 4,
          //   backgroundColor: "#f7f7f7", // Optional background color
          borderRadius: "8px", // Optional: adds rounded corners
          boxShadow: 3, // Optional: adds shadow for better visibility
        }}
      >
        {" "}
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <Typography variant="h5" component="h2">
            Is Server Live: {isServerLive ? "true" : "false"}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" onClick={toggleServer}>
            toggle
          </Button>
        </Box>
        <Divider />
        {isError ? (
          <Alert severity="error">{isError.message}</Alert>
        ) : isLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              p: 2,
              my: 10,
              textAlign: "center",
            }}
          >
            <CircularProgress size={78} />
          </Box>
        ) : (
          isServerLive && (
            <>
              <ViewBox
                label="Audio Paths"
                keySettings="audioPaths"
                paths={settings?.audioPaths || []}
                updatedFunc={updateFunction}
              />
              <ViewBox
                label="Image Paths"
                keySettings="imagePaths"
                paths={settings?.imagePaths || []}
                updatedFunc={updateFunction}
              />
              <Divider />
              <ViewBox
                label="Video Paths"
                keySettings="videoPaths"
                paths={settings?.videoPaths || []}
                updatedFunc={updateFunction}
              />
              <Divider />
              <InputBox
                label="Image Types"
                keySettings="imageExt"
                paths={settings?.imageExt || []}
                updatedFunc={updateFunction}
              />
              <InputBox
                label="Audio Types"
                keySettings="audioExt"
                paths={settings?.audioExt || []}
                updatedFunc={updateFunction}
              />
              <Divider />
              <InputBox
                label="Video Types"
                keySettings="videoExt"
                paths={settings?.videoExt || []}
                updatedFunc={updateFunction}
              />
              <Divider />
              <InputBox
                label="Allow List"
                keySettings="allowList"
                paths={settings?.allowList || []}
                updatedFunc={updateFunction}
              />
            </>
          )
        )}
      </Container>
    </>
  );
}
