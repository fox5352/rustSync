import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  TextField,
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
import { useSession } from "../../store/session";

export default function SettingsPage() {
  const { session, override, toggleOverride, setSession } = useSession();
  const [isServerLive, setIsServerLive] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isError, setIsError] = useState<StateError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateFunction = async (key: SettingsKeys, list: string[]) => {
    const data = {
      [key]: list,
    };

    try {
      if (session == null) throw new Error("Session not found");

      const settings = await updateSettings(data, session, true);

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

  const submitSessionData = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    const url = formData.get("url")?.toString();
    const token = formData.get("token")?.toString();

    if (!url || !token) return;

    setSession({ url, token });
  };

  useEffect(() => {
    ///-----------------------------------------------
    const fetchSettings = async () => {
      if (override == false && !isServerLive) return;

      try {
        if (session == null) throw new Error("Session not found");

        setIsLoading(true);
        setIsError(null);

        const settings = await getSettings(session);

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
      if (res != null && res != isServerLive) setIsServerLive(res);
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
        {/* server override section */}
        <Box component="form" onSubmit={submitSessionData}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              py: 2,
              my: 2,
              borderRadius: 1.5,
            }}
            component="fieldset"
          >
            <Typography
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "fit-content",
                px: 1,
              }}
              variant="h5"
              component="legend"
            >
              Server Configuration
            </Typography>
            <TextField
              id="url"
              name="url"
              label="URL"
              type="url"
              placeholder="Enter API URL"
              size="small"
              fullWidth
            />
            <TextField
              id="token"
              name="token"
              label="Token"
              type="text"
              placeholder="Enter API token"
              size="small"
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                sx={{
                  width: "160px",
                }}
                type="submit"
                variant="contained"
                size="small"
              >
                Submit
              </Button>
              <Button
                sx={{
                  width: "160px",
                }}
                variant="contained"
                color={override ? "warning" : "primary"}
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  toggleOverride();
                }}
              >
                {override ? "desable override" : "enable override"}
              </Button>
            </Box>
          </Box>
        </Box>
        <Divider />
        {/* error alert section */}
        {isError ? <Alert severity="error">{isError.message}</Alert> : <></>}
        {/* server settings section */}
        {isLoading ? (
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
        ) : isServerLive || override ? (
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
        ) : (
          <></>
        )}
      </Container>
    </>
  );
}
