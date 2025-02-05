import { Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { SettingsKeys } from "../../../lib/requests";
import { useState } from "react";
import { Add } from "@mui/icons-material";

type InputBox = {
  label: string;
  keySettings: SettingsKeys;
  paths: string[];
  updatedFunc: (key: SettingsKeys, list: string[]) => void;
};

function InputBox({ label, keySettings, paths, updatedFunc }: InputBox) {
  const [localTypes, setLocalTypes] = useState<string[]>(paths);
  const [input, setInput] = useState<string>("");

  const removeType = (index: number) => {
    setLocalTypes((prev) => {
      const buffer = prev.filter((_item, i) => i != index);
      updatedFunc(keySettings!, buffer);
      return buffer;
    });
  };

  const addNewType = () => {
    setLocalTypes((prev) => {
      const buffer = [...prev, input];
      updatedFunc(keySettings!, buffer);
      setInput("");
      return buffer;
    });
  };

  const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
      <Box sx={{ display: "flex" }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ textDecoration: "underline" }}
        >
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <TextField
          size="small"
          variant="outlined"
          placeholder="Enter text..."
          value={input}
          onChange={inputHandler}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "primary.main", // Using MUI's primary color
              },
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        />
        <Button
          onClick={addNewType}
          variant="contained"
          color="primary"
          sx={{ ml: 0.2 }}
        >
          <Add />
        </Button>
      </Box>
      <Stack sx={{ my: 0.5, overflowX: "auto" }} direction="row" spacing={1}>
        {localTypes.map((path, index) => (
          <Chip
            onClick={() => removeType(index)}
            key={index}
            label={path}
            color="primary"
            variant="filled"
            component="button"
            sx={{
              "&:hover": {
                backgroundColor: "crimson",
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

export default InputBox;
