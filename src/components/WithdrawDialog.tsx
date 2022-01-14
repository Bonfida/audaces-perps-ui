import React, { useState, useEffect } from "react";
import {
  makeStyles,
  withStyles,
  FormControl,
  InputLabel,
  InputAdornment,
  Button,
  ButtonGroup,
  Divider,
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
import { USDC_MINT, roundToDecimal } from "../utils/utils";
import { notify } from "../utils/notifications";
import Spin from "./Spin";
import { refreshAllCaches } from "../utils/fetch-loop";
import { useMargin } from "../hooks/useMargin";
import { useUserAccount } from "../hooks/useUserAccount";
import { useEcosystem } from "../hooks/useEcosystem";
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
  maxButton: {
    color: "#FFFFFF",
    textTransform: "uppercase",
    backgroundColor: "#37324d",
    "&:hover": {
      backgroundColor: "rgb(55, 51, 78)",
    },
  },
  endAdornment: {
    marginLeft: 10,
  },
  newMarginInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    color: "rgb(255, 255, 255)",
    fontSize: 18,
    textAlign: "center",
  },
  divider: {
    width: "30%",
    margin: "0px 10px 0px 10px",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  selectedButton: {
    fontWeight: 800,
    backgroundColor: "rgb(55, 51, 78)",
  },
  row: {
    fontSize: 14,
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "rgb(255, 255, 255)",
  },
});

const MIN_MARGIN_RATIO = 0.05;

enum WithdrawAmount {
  TwentyFive = 25 / 100,
  Fifty = 50 / 100,
  SeventyFive = 75 / 100,
  Hundred = 100 / 100,
}

const withdrawOption = [
  {
    label: "25%",
    value: WithdrawAmount.TwentyFive,
  },
  {
    label: "50%",
    value: WithdrawAmount.Fifty,
  },
  {
    label: "75%",
    value: WithdrawAmount.SeventyFive,
  },
  {
    label: "100%",
    value: WithdrawAmount.Hundred,
  },
];

const Row = ({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) => {
  const classes = useStyles();
  return (
    <div className={classes.row}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
};

const NewMarginInfo = ({
  leverage,
  margin,
  accountValue,
}: {
  leverage: number;
  margin: number;
  accountValue: number;
}) => {
  const classes = useStyles();
  return (
    <div style={{ width: "100%" }}>
      <div className={classes.newMarginInfo}>
        <Divider className={classes.divider} />
        <span>New margin</span>
        <Divider className={classes.divider} />
      </div>
      <Row label="New leverage" value={roundToDecimal(leverage, 2) + "x"} />
      <Row label="New margin" value={roundToDecimal(margin, 2)} />
      <Row
        label="New account value"
        value={roundToDecimal(accountValue / Math.pow(10, 6), 3)}
      />
    </div>
  );
};

const WithdrawDialog = () => {
  const classes = useStyles();
  const [amount, setAmount] = useState<number | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [userAccount] = useUserAccount();
  const [ecosystem] = useEcosystem();
  const [margin] = useMargin(userAccount, ecosystem);
  const [selected, setSelected] = useState<null | WithdrawAmount>(null);
  const [newMargin] = useMargin(
    userAccount,
    ecosystem,
    amount ? -amount : null
  );

  const maxWithdraw = margin
    ? (margin.accountValue - margin.totalNotional * MIN_MARGIN_RATIO) /
      Math.pow(10, 9)
    : 0;

  useEffect(() => {
    if (maxWithdraw && selected) {
      setAmount(selected * maxWithdraw);
    }
  }, [maxWithdraw, selected]);

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
      refreshAllCaches();
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
          value={roundToDecimal(amount, 3)}
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
          endAdornment={
            <InputAdornment position="start" className={classes.endAdornment}>
              <Button
                onClick={() => setSelected(WithdrawAmount.Hundred)}
                variant="contained"
                className={classes.maxButton}
              >
                Max
              </Button>
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
        {withdrawOption.map((option, key) => {
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
      {/* Recompute margin and show results */}
      {amount && (
        <>
          {newMargin ? (
            <NewMarginInfo
              accountValue={newMargin.accountValue}
              margin={newMargin.margin}
              leverage={1 / newMargin.margin}
            />
          ) : (
            <Spin size={20} />
          )}
        </>
      )}
      <Button
        variant="contained"
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
