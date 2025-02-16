import { useEffect, useMemo, useState } from "react";

import { Image, MusicNote, Videocam } from "@mui/icons-material";
import { Box, Menu, MenuItem, Tooltip, Typography } from "@mui/material";

import styles from "./FileBlock.module.css";

type AudioMetaData = {
  duration: number;
  sampleRate: number;
};

type ImageMetaData = {
  thumbnail: {
    data: number[];
    type: string;
  };
};

export type FileBlockProps = {
  name: string;
  path: string;
  extension: string;
  type: string;
  metadata: {
    size: number;
    created: string;
    modified: string;
    type: string;
    imageMetaData?: ImageMetaData;
    audioMetaData?: AudioMetaData;
  };
};

export default function FileBlock({ name, type, metadata }: FileBlockProps) {
  const [image, setImage] = useState<string | null>(null);
  const [additionalData, setAdditionalData] = useState({
    duration: "",
    size: "",
  });

  // menu Component
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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

  useEffect(() => {
    if (metadata.imageMetaData?.thumbnail) {
      const uint8Array = new Uint8Array(metadata.imageMetaData?.thumbnail.data);
      const blob = new Blob([uint8Array], { type: "image/png" }); // Change type if needed
      const url = URL.createObjectURL(blob);
      setImage(url);

      return () => URL.revokeObjectURL(url);
    }

    if (metadata.audioMetaData != undefined) {
      const audioMetaData = metadata.audioMetaData;

      setAdditionalData((prev) => {
        const totalSeconds = Math.round(audioMetaData.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        let formattedDuration;
        if (minutes >= 60) {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          formattedDuration = `${hours}h ${remainingMinutes}m`;
        } else if (minutes > 0) {
          formattedDuration = `${minutes}m ${seconds}s`;
        } else {
          formattedDuration = `${seconds}s`;
        }

        return {
          ...prev,
          duration: formattedDuration,
        };
      });
    }

    if (metadata.size) {
      setAdditionalData((prev) => {
        const mb = metadata.size / (1024 * 1024);

        const size =
          mb < 1024 ? `${mb.toFixed(2)} MB` : `${(mb / 1024).toFixed(2)} GB`;

        return {
          ...prev,
          size,
        };
      });
    }
  }, [metadata.imageMetaData?.thumbnail.data]);

  return (
    <>
      <Box
        component="button"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
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
            {name.slice(0, 13) + "..."}
          </Typography>
        </Tooltip>
        <Box sx={{ height: "75%", position: "relative" }}>
          {/* bg icon */}
          <Box
            sx={{
              position: "absolute",
              zIndex: 0,
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
          {/* image cover */}
          <Box
            sx={{
              position: "absolute",
              zIndex: 1,
              top: "0%",
              left: "0%",
              width: "100%",
              height: "100%",
            }}
          >
            {image && <img className={styles.image} src={image} />}
          </Box>
          {/* additional data */}
          {(type == "video" || type == "audio") && (
            <Box
              sx={{
                position: "absolute",
                zIndex: 2,
                bottom: "0%",
                left: "0%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: "4px",
                width: "calc(100% - 8px)",
                height: "30%",
                fontSize: "13px",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.11)",
                }}
                component="div"
              />
              <Typography variant="inherit" component="p">
                {additionalData.duration}
              </Typography>
              <Typography variant="inherit" component="p">
                {additionalData.size}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem disabled>Delete</MenuItem>
      </Menu>
    </>
  );
}
