import { Box, CircularProgress, Divider, Typography } from "@mui/material";

import { StateError } from "../../../type";
import FolderBlock from "./FolderBlock";
import { useEffect, useMemo, useState } from "react";
import { FileData, getFiles } from "../../../lib/requests";
import { useSession } from "../../../store/session";

interface FileView {
  title: string;
  type: string;
}

export default function FileView({ title, type }: FileView) {
  const { session } = useSession();

  const memoSession = useMemo(() => session, [session?.url, session?.token]);

  // page state
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<StateError | null>(null);
  const [fileData, setFileData] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchFileData = async () => {
      if (!memoSession) return;
      setIsError(null);
      setIsLoading(true);

      const [res, err] = await getFiles<FileData[]>(type, memoSession);

      if (err || !res) {
        setIsError({
          message: err ? err : "failed to get data",
          colorCode: "error",
        } as StateError);
        setIsLoading(false);
        return;
      }

      setFileData(res.data);
      setIsLoading(false);
      setIsError(null);
    };

    fetchFileData();
  }, [memoSession]);

  return (
    <Box
      sx={{
        minHeight: "438px",
      }}
    >
      <Typography variant="h5" component="h2">
        {title}
      </Typography>
      <Divider />
      {isError ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "223px",
          }}
        >
          <Typography
            variant="h4"
            color="error"
            sx={{ textAlign: "center", alignSelf: "center" }}
          >
            {isError.message}
          </Typography>
        </Box>
      ) : isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "373px",
          }}
        >
          <CircularProgress
            sx={{ alignSelf: "center", mx: "auto" }}
            size={100}
          />
        </Box>
      ) : (
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
      )}
    </Box>
  );
}
