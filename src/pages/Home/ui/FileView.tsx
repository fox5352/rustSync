import { Box, Divider, Typography } from "@mui/material";

import { StateError } from "../../../type";
import FolderBlock from "./FolderBlock";

interface FileView {
  isLoading: boolean;
  isError: StateError | null;
  title: string;
  fileData: any[] | null;
  type: string;
}

export default function FileView({ title, fileData, type }: FileView) {
  return (
    <Box>
      <Typography variant="h5" component="h2">
        {title}
      </Typography>
      <Divider />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridAutoRows: "371px",
          gap: 1,
          height: "373px",
          py: 2,
          overflowY: "auto",
        }}
      >
        {fileData &&
          fileData.map((block) => (
            <FolderBlock folder={block.key} fileData={block} type={type} />
          ))}
      </Box>
    </Box>
  );
}
