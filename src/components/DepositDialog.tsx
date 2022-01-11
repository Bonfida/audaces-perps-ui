import React, { useState, useEffect } from "react";
import {
  makeStyles,
  withStyles,
  FormControl,
  InputLabel,
  InputAdornment,
  Button,
  ButtonGroup,
} from "@material-ui/core";
import usdc from "../assets/crypto/usdc.png";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import {
  createUserAccount,
  AUDACES_ID,
  ECOSYSTEM,
  UserAccount,
  addCollateral,
  Ecosystem,
} from "@audaces/perps";
import { sendTx } from "../utils/send";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { roundToDecimal, USDC_MINT } from "../utils/utils";
import { notify } from "../utils/notifications";
import Spin from "./Spin";
import { useBalances } from "../hooks/useBalances";
import clsx from "clsx";

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
  selectedButton: {
    fontWeight: 800,
    backgroundColor: "rgb(55, 51, 78)",
  },
});

enum DepositAmount {
  TwentyFive = 25 / 100,
  Fifty = 50 / 100,
  SeventyFive = 75 / 100,
  Hundred = 100 / 100,
}

const depositOptions = [
  {
    label: "25%",
    value: DepositAmount.TwentyFive,
  },
  {
    label: "50%",
    value: DepositAmount.Fifty,
  },
  {
    label: "75%",
    value: DepositAmount.SeventyFive,
  },
  {
    label: "100%",
    value: DepositAmount.Hundred,
  },
];

const DepositDialog = ({
  userAccount,
}: {
  userAccount: undefined | null | UserAccount;
}) => {
  const classes = useStyles();
  const [amount, setAmount] = useState<number | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [usdcBalance, usdcBalanceLoaded] = useBalances(USDC_MINT);
  const [selected, setSelected] = useState<null | DepositAmount>(null);

  useEffect(() => {
    if (usdcBalanceLoaded && usdcBalance && selected) {
      setAmount(selected * usdcBalance);
    }
  }, [usdcBalance, usdcBalanceLoaded, selected]);

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSelected(null);
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
      // Check if the user has already an account
      if (!userAccount) {
        // Create account
        const create_ix = await createUserAccount(
          connection,
          publicKey,
          10,
          100,
          AUDACES_ID,
          ECOSYSTEM,
          publicKey
        );
        await sendTx(
          connection,
          publicKey,
          create_ix.instructions,
          sendTransaction
        );
      }

      // Handle deposit

      const ecosystem = await Ecosystem.retrieve(connection, ECOSYSTEM);

      const deposit_ix = await addCollateral(
        publicKey,
        ECOSYSTEM,
        ecosystem,
        AUDACES_ID,
        amount * Math.pow(10, 6),
        USDC_MINT
      );

      await sendTx(
        connection,
        publicKey,
        deposit_ix.instructions,
        sendTransaction
      );
    } catch (err) {
      console.log(err);
      notify({ message: "Error depositing", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <span className={classes.title}>Deposit Funds</span>
      <FormControl variant="outlined" style={{ width: "100%" }}>
        <InputLabel htmlFor="outlined-adornment">USDC Amount</InputLabel>
        <CssInput
          notched={true}
          fullWidth={true}
          value={roundToDecimal(amount, 3)}
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
      <ButtonGroup
        fullWidth
        color="primary"
        aria-label="outlined primary button group"
      >
        {depositOptions.map((option, key) => {
          return (
            <Button
              onClick={() => setSelected(option.value)}
              key={`${option}-${key}`}
              className={clsx(
                selected === option.value ? classes.selectedButton : undefined
              )}
            >
              {option.label}
            </Button>
          );
        })}
      </ButtonGroup>
      <Button
        disabled={!amount}
        onClick={handleDeposit}
        className={classes.button}
      >
        {loading ? <Spin size={20} /> : "Deposit"}
      </Button>
    </div>
  );
};

export default DepositDialog;
