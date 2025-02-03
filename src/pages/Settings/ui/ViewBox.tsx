import { useState } from "react";

import { Box, Typography, Button, Divider, IconButton } from "@mui/material";
import { Delete, AddBox } from "@mui/icons-material"
import { SettingsKeys } from "../../../lib/requests";

type ViewBox = {
  label: string;
  key: SettingsKeys;
  paths: string[];
  updatedFunc: (key: SettingsKeys, list: string[]) => {}
}

export default function ViewBox({ label, key, paths, updatedFunc }: ViewBox) {
  const [selected, setSelected] = useState<number | null>(null);

  const removeSelected = () => {
    if (selected == null) return;

    const pathsCopy = [...paths];
    pathsCopy.splice(selected, 1);

    // TODO: use update function
    console.log(pathsCopy);
  }

  const addNewPath = () => { }

  const selectLogic = (index: number) => {
    if (index == selected) {
      setSelected(null);
    } else {
      setSelected(index);
    }
  }

  return (
    <Box
      minHeight={300}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: 2,
      }}>
      {/*  */}
      <Box sx={{ display: "flex" }}>
        <Typography variant="h5" component="h2" sx={{ textDecoration: "underline" }}>
          {label}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box>
          <IconButton onClick={addNewPath}>
            <AddBox />
          </IconButton>
          <IconButton onClick={removeSelected}>
            <Delete />
          </IconButton>
        </Box>
      </Box>
      {/*  */}
      <Box id="test" sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 1,
        border: "1px solid #ccc",
        borderRadius: 2,
        height: "100%"
      }}>
        {
          paths.map((path, index) => (
            <Button key={index} sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1,
              border: "1px solid #ccc",
              borderRadius: 1.3,
            }}
              onClick={() => selectLogic(index)}
              variant={selected === index ? "contained" : "outlined"}
            >
              <Box>{index + 1}. {path}</Box>
            </Button>
          ))
        }
      </Box>
    </Box>
  )
}
