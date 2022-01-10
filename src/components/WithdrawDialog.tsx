import React, { useState } from "react";
import {
  makeStyles,
  withStyles,
  FormControl,
  InputLabel,
  InputAdornment,
  Button,
} from "@material-ui/core";
import usdc from "../assets/crypto/usdc.png";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import {
  AUDACES_ID,
  ECOSYSTEM,
  withdrawCollateral,
  Ecosystem,
} from "@audaces/perps";
import { sendTx } from "../utils/send";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { USDC_MINT } from "../utils/utils";
import { notify } from "../utils/notifications";
import Spin from "./Spin";

const CssInput = withStyles({
  input: {
    width: "100%",
    color: "#FFFFFF",
    fontSize: 18,
  },
})(OutlinedInput);

const useStyles = makeStyles({
  outlineInput: {
    $hover: {
      width: "100%",
    },
  },
  inputProps: {
    color: "#FFFFFF",
    width: "100%",
  },
  img: {
    height: 30,
  },
  button: {
    fontSize: 16,
    color: "white",
    fontWeight: 600,
    height: 60,
    textTransform: "capitalize",
    width: "100%",
    backgroundColor: "#37324d",
    "&:hover": {
      backgroundColor: "rgb(55, 51, 78)",
    },
    "&.Mui-disabled": {
      color: "white",
      pointerEvents: "unset",
      cursor: "not-allowed",
      backgroundColor: "rgb(55, 51, 78)",
      "&:hover": {
        backgroundColor: "rgb(55, 51, 78)",
      },
    },
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: 600,
    textAlign: "center",
  },
  root: {
    height: 400,
    width: 350,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
  },
});

const WithdrawDialog = () => {
  const classes = useStyles();
  const [amount, setAmount] = useState<number | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value);
    if (isNaN(value) || !isFinite(value) || value < 0) {
      return;
    }
    setAmount(value);
  };

  const handleDeposit = async () => {
    if (!publicKey || !amount) return;

    try {
      setLoading(true);

      // Handle withdrawal

      const ecosystem = await Ecosystem.retrieve(connection, ECOSYSTEM);

      const withdraw_ix = await withdrawCollateral(
        publicKey,
        amount * Math.pow(10, 6),
        AUDACES_ID,
        ECOSYSTEM,
        ecosystem,
        USDC_MINT
      );

      await sendTx(
        connection,
        publicKey,
        withdraw_ix.instructions,
        sendTransaction
      );
    } catch (err) {
      console.log(err);
      notify({ message: "Error withdrawing", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <span className={classes.title}>Withdraw Funds</span>
      <FormControl variant="outlined" style={{ width: "100%" }}>
        <InputLabel htmlFor="outlined-adornment">USDC Amount</InputLabel>
        <CssInput
          notched={true}
          fullWidth={true}
          className={classes.outlineInput}
          placeholder="USDC amount"
          onChange={handleChange}
          inputProps={{
            classes: classes.inputProps,
            min: 0,
            type: "number",
          }}
          startAdornment={
            <InputAdornment position="start">
              <img src={usdc} alt="" className={classes.img} />
            </InputAdornment>
          }
          labelWidth={100}
        />
      </FormControl>
      <Button
        disabled={!amount}
        onClick={handleDeposit}
        className={classes.button}
      >
        {loading ? <Spin size={20} /> : "Withdraw"}
      </Button>
    </div>
  );
};

export default WithdrawDialog;
