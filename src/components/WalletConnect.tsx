import React from "react";
import Button from "@material-ui/core/Button";
import { useWallet } from "../utils/wallet";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  button: {
    color: "white",
    background: "transparent",
    width: "auto",
    borderRadius: 25,
    height: "50px",
    backgroundColor: "#8BC6EC",
    backgroundImage: "linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)",
    fontWeight: 600,
    padding: 20,
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
        className={classes.button}
      >
        {!connected ? <>Connect wallet</> : <>Disconnect</>}
      </Button>
    </React.Fragment>
  );
}
