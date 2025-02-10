import { useState, useEffect } from "react";

import { Box, Container, Button, Typography } from "@mui/material";

import { Home } from "@mui/icons-material";
import { QRCodeCanvas } from "qrcode.react";

import { Link } from "react-router";
import { getServerStatus, getSessionData } from "../../lib/requests";

export default function Sync() {
  const [isServerLive, setIsServerLive] = useState(true);
  const [address, setAddress] = useState<{
    addr: string;
    token: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const [addr, token] = await getSessionData();

      if (addr) {
        setAddress({ addr, token });
      }
    })();
  }, []);

  useEffect(() => {
    const fetchServerStatus = async () => {
      const serverState = await getServerStatus();

      setIsServerLive(serverState ? serverState : false);
    };

    fetchServerStatus();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100",
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
            {isServerLive ? (
              address ? (
                <QRCodeCanvas value={`${address.addr}?${address.token}`} />
              ) : (
                <></>
              )
            ) : (
              <></>
            )}
          </Box>
          {/* raw ip address */}
          <Box
            sx={{
              px: 2,
              borderRadius: "4px", // Optional: adds rounded corners
            }}
            bgcolor="secondary"
          >
            {isServerLive ? (
              address ? (
                <>
                  <Typography variant="body1" component="p">
                    {address.addr}
                  </Typography>
                  <Typography variant="body2" component="p">
                    {address.token}
                  </Typography>
                </>
              ) : (
                "Ip not found"
              )
            ) : (
              "Server is offline"
            )}
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
