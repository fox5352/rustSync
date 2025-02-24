import { useEffect, useState } from "react";

import {
  FileData,
  getFiles,
  getSettings,
  Settings,
} from "../../lib/requests";
import { Container, Divider } from "@mui/material";
import FileView from "./ui/FileView";
import { useSession } from "../../store/session";

export default function Home() {
  const { session } = useSession();
  const [pageState, setPageState] = useState<any>({
    isImagesLoading: false,
    isImagesError: null,
    images: null,
    isAudiosLoading: false,
    isAudiosError: null,
    audios: null,
    isVideosLoading: false,
    isVideosError: null,
    videos: null,
  });

  const manageStateFromData = async (allowList: string[]) => {
    if (session == null) return;

    for (const fileType of allowList) {
      const [res, error] = await getFiles<FileData[]>(fileType, session);
      const capitalizeFirstLetter = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);

      const block = `${capitalizeFirstLetter(fileType)}s`;

      if (error || !res) {
        setPageState((prev: any) => ({
          ...prev,
          [`is${block}Error`]: {
            message: error,
            colorCode: "error",
          },
          [`is${block}Loading`]: false,
        }));
        continue;
      }

      const { data: fileDataArray } = res;

      setPageState((prev: any) => ({
        ...prev,
        [`is${block}Loading`]: false,
        [`is${block}Error`]: null,
        [`${block.toLowerCase()}`]: fileDataArray,
      }));
    }
  };

  useEffect(() => {
    (async () => {
      setPageState((prev: any) => ({
        ...prev,
        isImagesLoading: true,
        isImagesError: null,
        isAudiosLoading: true,
        isAudiosError: null,
        isVideosLoading: true,
        isVideosError: null,
      }));
      if (session == null) return;

      let { allowList }: Settings = await getSettings(session);

      if (!allowList) {
        // TODO: add a way to give hole page error
        return;
      }

      await manageStateFromData(allowList);
    })();
  }, [session]);

  return (
    <>
      <Container
        maxWidth="md"
        component="section"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          flexGrow: 1,
          p: 2,
          my: 1,
        }}
      >
        <FileView
          {...pageState}
          title="Audios"
          fileData={pageState.audios}
          type="audio"
        />
        <Divider />
        <FileView
          {...pageState}
          title="Images"
          fileData={pageState.images}
          type="image"
        />
        <Divider />
        <FileView
          {...pageState}
          title="Videos"
          fileData={pageState.videos}
          type="video"
        />
      </Container>
    </>
  );
}
