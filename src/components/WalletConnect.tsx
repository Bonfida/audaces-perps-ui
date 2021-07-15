import React from "react";
import Button from "@material-ui/core/Button";
import { useWallet } from "../utils/wallet";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  button: {
    color: "white",
    background: "transparent",
    width: "auto",
    borderRadius: 0,
    height: "50px",
    border: "2px solid",
    borderColor: "#00ADB5",
  },
  lock: {
    marginRight: "10px",
  },
});

export default function WalletConnect() {
  const classes = useStyles();
  const { connected, disconnect, select } = useWallet();

  return (
    <React.Fragment>
      <Button
        disableRipple
        onClick={connected ? disconnect : select}
        variant="outlined"
        className={classes.button}
      >
        {!connected ? <>Connect wallet</> : <>Disconnect</>}
      </Button>
    </React.Fragment>
  );
}
