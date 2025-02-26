import { Container, Divider } from "@mui/material";
import FileView from "./ui/FileView";

export default function Home() {
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
        <FileView title="Audios" type="audio" />
        <Divider />
        <FileView title="Images" type="image" />
        <Divider />
        <FileView title="Videos" type="video" />
      </Container>
    </>
  );
}
