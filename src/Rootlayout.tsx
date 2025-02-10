import { Outlet } from "react-router-dom";

import Navbar from "./ui/Navbar";
import { Container } from "@mui/material";

export default function Rootlayout() {
  return (
    <>
      <Navbar />
      <Container
        maxWidth="lg"
        component="main"
        sx={{ height: "100vh", overflowY: "scroll", pb: 12 }}
      >
        <Outlet />
      </Container>
    </>
  );
}
