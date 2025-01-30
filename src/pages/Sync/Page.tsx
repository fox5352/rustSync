import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";

import { Box, Container, TextField, Button, Typography } from "@mui/material";
import { Home } from "@mui/icons-material";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router";

export default function Sync() {
  const [address, setAddress] = useState<string | null>(null);

  const getIpv4Address = async () => {
    const res = await invoke("get_server_address");
    if (res) {
      setAddress(`${res}:${9090}`);
    }
  };
  useEffect(() => {
    getIpv4Address();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          p: 2,
          my: 10,
          textAlign: "center",
          //   backgroundColor: "#f7f7f7", // Optional background color
          borderRadius: "8px", // Optional: adds rounded corners
          boxShadow: 3, // Optional: adds shadow for better visibility
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* QR Code Image */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "150px",
              height: "150px",
            }}
            border={!address ? "1px solid black" : "none"}
            borderRadius={!address ? "4px" : "none"}
          >
            {address ? <QRCodeCanvas value={address} /> : <></>}
          </Box>
          {/* raw ip address */}
          <Box
            sx={{
              px: 2,
              borderRadius: "4px", // Optional: adds rounded corners
            }}
            bgcolor="secondary"
          >
            <Typography variant="body1" component={address ? "clipPath" : "p"}>
              {address ? address : "Ip not found"}
            </Typography>
          </Box>

          <Link to="/">
            <Button variant="contained" startIcon={<Home />}>
              Home
            </Button>
          </Link>
        </Box>

        {/* Form */}
      </Box>
    </Container>
  );
}
