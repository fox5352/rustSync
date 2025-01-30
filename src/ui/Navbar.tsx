import { ReactNode } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import Home from "@mui/icons-material/Home";
import SyncIcon from "@mui/icons-material/Sync";
import SettingsIcon from "@mui/icons-material/Settings";

import { Link } from "react-router";
import { ButtonGroup, Container, Typography } from "@mui/material";

type LinkTag = {
  a: string;
  text: string;
  icon: ReactNode;
};

export default function Navbar() {
  const links: LinkTag[] = [
    { a: "/", text: "home", icon: <Home /> },
    { a: "/sync", text: "Sync", icon: <SyncIcon /> },
    { a: "/settings", text: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <div>
      <Container maxWidth="lg">
        <Box
          component="header"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* TODO: swap with logo later */}
          <Typography variant="h5" component="h1">
            Rust Sync
          </Typography>
          {/* <Button variant="contained" onClick={toggleDrawer(true)}>
            Open drawer
          </Button> */}
          <Box flex={1} />
          {/* Button group of three buttons */}
          <ButtonGroup variant="outlined">
            {links.map((link, index) => (
              <Link to={link.a}>
                <Button startIcon={link.icon}>{link.text}</Button>
              </Link>
            ))}
          </ButtonGroup>
        </Box>
      </Container>
    </div>
  );
}
