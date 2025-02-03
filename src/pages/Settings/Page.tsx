import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Container, Divider } from "@mui/material";

import { StateError } from "../../type";

import ViewBox from "./ui/ViewBox";
import { getSettings, Settings, SettingsKeys, updateSettings } from "../../lib/requests";


export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isError, setIsError] = useState<StateError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateFunction = async (key: SettingsKeys, list: string[]) => {
    const data = {
      [key]: list,
    }

    try {
      const settings = await updateSettings(data, true)
      setSettings(settings);
    } catch (e) {
      console.error("Failed to update settings:", e);
      setIsError({
        message: "Failed to update settings",
        colorCode: "error",
      } as StateError);
    }
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setIsError(null);
        const settings = await getSettings();

        setSettings(settings);
      } catch (e: any) {
        setIsError({
          message: e.message,
          colorCode: "error",
        } as StateError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <>
      {
        isError ?
          <Alert severity="error">{isError.message}</Alert>
          : isLoading ? <Box sx={{
            display: "flex", flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            p: 2,
            my: 10,
            textAlign: "center",
          }}>
            <CircularProgress size={78} />
          </Box>
            :
            <Container id="testing" sx={{
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
            }}>
              <ViewBox label="Audio Paths" paths={settings?.audioPaths || []} updatedFunc={updateFunction} />
              <Divider />
              <ViewBox label="Image Paths" paths={settings?.imagePaths || []} updatedFunc={updateFunction} />
            </Container>
      }
    </>
  );
}
