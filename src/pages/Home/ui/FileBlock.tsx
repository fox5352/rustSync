import { Image, MusicNote, Videocam } from "@mui/icons-material";
import { Box, Tooltip, Typography } from "@mui/material";
import { useMemo } from "react";

export type FileBlockProps = {
  name: string;
  path: string;
  extension: string;
  type: string;
};

export default function FileBlock({
  name,
  path,
  extension,
  type,
}: FileBlockProps) {
  const Icon = useMemo(() => {
    switch (type) {
      case "audio": {
        return () => <MusicNote />;
      }
      case "image": {
        return () => <Image />;
      }
      // TODO: add video and image
      default:
        return () => <Videocam />;
    }
  }, []);

  return (
    <Box
      sx={{
        border: "1px solid rgba(211, 211, 211, 0.32)",
        backgroundColor: "#f7f7f7", // Optional background color
        borderRadius: "8px", // Optional: adds rounded corners
        boxShadow: 3, // Optional: adds shadow for better visibility
        overflow: "hidden",
      }}
    >
      <Tooltip arrow placement="top" title={name}>
        <Typography
          sx={{
            height: "25%",
            px: 0.6,
            overflow: "hidden",
          }}
        >
          {/* TODO: add hover to display fill name */}

          {name.slice(0, 13) + "..."}
        </Typography>
      </Tooltip>
      <Box sx={{ height: "75%", position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: "0%",
            left: "0%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Icon />
        </Box>
      </Box>
    </Box>
  );
}
