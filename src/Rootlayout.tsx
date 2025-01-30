import { Outlet } from "react-router-dom";

import Navbar from "./ui/Navbar";
import { Container } from "@mui/material";

export default function Rootlayout() {
  return (
    <>
      <Navbar />
      <Container maxWidth="lg" component="main">
        <Outlet />
      </Container>
    </>
  );
}
