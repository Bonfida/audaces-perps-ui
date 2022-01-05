import React, { useState } from "react";
import { Typography, Button } from "@material-ui/core";
import clsx from "clsx";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import usdc from "../assets/crypto/usdc.png";
import { LinkIcon } from "@heroicons/react/solid";
import { notify } from "../utils/notifications";
import { Connection, PublicKey } from "@solana/web3.js";
import { useSmallScreen } from "../utils/utils";

const useStyles = makeStyles((theme) => ({
  h1: {
    color: "#FFFFFF",
    fontSize: 68,
    margin: 10,
    fontWeight: 800,
    lineHeight: "1.0em",
  },
  h2: {
    color: "#FFFFFF",
    fontSize: 42,
    margin: 10,
    fontWeight: 800,
    lineHeight: "1.0em",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 24,
    margin: 10,
  },
  root: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    height: "100vh",
  },
  margin: {
    margin: 10,
  },
  textField: {
    width: 500,
  },
  img: {
    height: 30,
  },
  inputProps: {
    color: "#FFFFFF",
    width: "100%",
  },
  outlineInput: {
    $hover: {
      width: "100%",
    },
  },
  linkIcon: {
    color: "#FFFFFF",
    height: 20,
  },
  helperText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  downloadButton: {
    background: "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
    borderRadius: 30,
    margin: 1,
    textTransform: "capitalize",
    width: 300,
    color: "#77E3EF",
    fontWeight: 800,
    height: 60,
    fontSize: 24,
    "&:hover": {
      background:
        "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
    },
  },
  downloadButtonContainer: {
    background: "linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)",
    borderRadius: 30,
    width: 302,
    marginTop: 20,
    marginLeft: 10,
    height: 62,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    maxWidth: 500,
    margin: 20,
  },
  fileName: {
    background: "white",
    color: "black",
    padding: "2px 5px 2px 5px",
  },
}));

const CssInput = withStyles({
  input: {
    width: "100%",
    color: "#FFFFFF",
    fontSize: 18,
  },
})(OutlinedInput);

const InnerPage = () => {
  const classes = useStyles();
  const [address, setAddress] = useState<string | null>(null);
  const [rpc, setRpc] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!rpc || !address) {
      return notify({ message: "Missing input" });
    }
    let connection: Connection;
    try {
      connection = new Connection(rpc);
      const { value } = await connection.getParsedAccountInfo(
        new PublicKey(address)
      );
      if (
        //@ts-ignore
        value?.data?.parsed?.info?.mint !==
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      ) {
        return notify({ message: "Invalid USDC token account" });
      }
    } catch (err) {
      return notify({ message: "Connection error - Check the RPC URL" });
    }

    const file = `REACT_APP_REFERRAL_FEES_ADDRESS=${address}\nREACT_APP_CONNECTION=${rpc}\nREACT_APP_CONNECTION_DEV=${rpc}`;
    const blob = new Blob([file], { type: "octet/stream" });
    const fileDownloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileDownloadUrl;
    link.setAttribute("download", "auto_generated.env");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={classes.column}>
      {/* USDC Address */}

      <FormControl
        className={clsx(classes.margin, classes.textField)}
        variant="outlined"
      >
        <InputLabel htmlFor="outlined-adornment">USDC Address</InputLabel>
        <CssInput
          notched={true}
          fullWidth={true}
          className={classes.outlineInput}
          type="text"
          placeholder="USDC address"
          onChange={(e) => setAddress(e.target.value)}
          inputProps={{
            classes: classes.inputProps,
          }}
          startAdornment={
            <InputAdornment position="start">
              <img src={usdc} alt="" className={classes.img} />
            </InputAdornment>
          }
          labelWidth={100}
        />
        <FormHelperText className={classes.helperText}>
          USDC address to collect fees
        </FormHelperText>
      </FormControl>

      {/* RPC Endpoints */}

      <FormControl
        className={clsx(classes.margin, classes.textField)}
        variant="outlined"
      >
        <InputLabel htmlFor="outlined-adornment">RPC URL</InputLabel>
        <CssInput
          notched={true}
          fullWidth={true}
          className={classes.outlineInput}
          type="text"
          placeholder="RPC URL"
          onChange={(e) => setRpc(e.target.value)}
          inputProps={{
            classes: classes.inputProps,
          }}
          startAdornment={
            <InputAdornment position="start">
              <LinkIcon className={classes.linkIcon} />
            </InputAdornment>
          }
          labelWidth={65}
        />
        <FormHelperText className={classes.helperText}>
          Your RPC URL endpoint e.g https://solana-api.projectserum.com
        </FormHelperText>
      </FormControl>
      <div className={classes.downloadButtonContainer}>
        <Button onClick={handleDownload} className={classes.downloadButton}>
          Download
        </Button>
      </div>
    </div>
  );
};

const Explainer = () => {
  const classes = useStyles();
  return (
    <div className={classes.column}>
      <Typography className={classes.h1}>Create your UI</Typography>
      <Typography className={classes.text}>
        In order to set up your own UI and collect fees you will have to create
        a <span className={classes.fileName}>.env</span> file with certain
        environament variables.
      </Typography>
      <Typography className={classes.text}>
        This form will autogenerate a file named{" "}
        <span className={classes.fileName}>auto_generated.env</span>
      </Typography>
      <Typography className={classes.text}>
        If its content is correct rename it{" "}
        <span className={classes.fileName}>.env</span> and place it in the
        project folder.
      </Typography>
    </div>
  );
};

const CreateUiPage = () => {
  const classes = useStyles();
  const smallScreen = useSmallScreen();
  return (
    <div
      className={classes.root}
      style={{ flexDirection: smallScreen ? "column" : "row" }}
    >
      <Explainer />
      <InnerPage />
    </div>
  );
};

export default CreateUiPage;
