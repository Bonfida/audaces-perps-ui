import React, { useState, useMemo } from "react";
import FloatingCard from "./FloatingCard";
import LeverageSlider from "./LeverageSlider";
import { makeStyles } from "@material-ui/core/styles";
import { notify } from "../utils/notifications";
import {
  Typography,
  Button,
  TextField,
  FormControl,
  Tab,
  Tabs,
  AppBar,
  Grid,
} from "@material-ui/core";
import { PositionType, createPosition } from "@audaces/perps";
import {
  USDC_DECIMALS,
  checkTextFieldNumberInput,
  roundToDecimal,
} from "../utils/utils";
import { useConnection } from "../utils/connection";
import { Transaction } from "@solana/web3.js";
import { useMarket, useMarkPrice, MAX_LEVERAGE } from "../utils/market";
import { useWallet } from "../utils/wallet";
import { sendTransaction } from "../utils/send";
import Spin from "./Spin";
import { refreshAllCaches } from "../utils/fetch-loop";
import { IsolatedPositionChip } from "./Chips";
import MouseOverPopOver from "./MouseOverPopOver";
import { useReferrer } from "../utils/perpetuals";
import Emoji from "./Emoji";
import CreateUserAccountButton from "./CreateUserAccountButton";
import { ModalAdd } from "./AccountsTable";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  AppBar: {
    marginTop: "40px",
    background: "transparent",
  },
  sellIndicator: {
    backgroundColor: "#FF3B69",
  },
  buyIndicator: {
    backgroundColor: "#02C77A",
  },
  buyTab: {
    color: "#02C77A",
    fontSize: 14,
  },
  sellTab: {
    color: "#FF3B69",
    fontSize: 14,
  },
  inputProps: {
    color: "white",
    width: "100%",
    fontSize: 14,
  },
  whiteText: {
    color: "white",
    fontSize: 14,
  },
  approx: {
    margin: 10,
    fontSize: 14,
    color: "white",
  },
  sizeContainer: {
    marginTop: 50,
  },
  leverageContainer: {
    paddingRight: "11%",
    paddingLeft: 10,
  },
  buyButton: {
    background: "#02C77A",
    maxWidth: 300,
    width: "100%",
    border: "1px solid",
    color: "white",
    borderColor: "transparent",
    "&:hover": {
      color: "#02C77A",
      borderColor: "#02C77A",
      cursor: "pointer",
    },
  },
  sellButton: {
    background: "#FF3B69",
    maxWidth: 300,
    width: "100%",
    border: "1px solid",
    color: "white",
    borderColor: "transparent",
    "&:hover": {
      color: "#FF3B69",
      borderColor: "#FF3B69",
      cursor: "pointer",
    },
  },
  buttonText: {
    fontSize: 14,
    color: "white",
    fontWeight: 400,
  },
  maxPositionContainer: {
    marginLeft: 5,
    marginBottom: 4,
  },
  leverageWarning: {
    color: "white",
    fontWeight: 600,
    textAlign: "center",
  },
});

const TradeForm = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [leverage, setLeverage] = useState(1);
  const [side, setSide] = useState(0);
  const [baseSize, setBaseSize] = useState("0");
  const [quoteSize, setQuoteSize] = useState("0");
  const { userAccount, marketState } = useMarket();
  const connection = useConnection();
  const { wallet, connected, connect } = useWallet();
  const markPrice = useMarkPrice();
  const [slippage, setSlippage] = useState<null | number>(null);
  const referrer = useReferrer();
  const [openDeposit, setOpenDeposit] = useState(false);

  const handleSetSide = (event, newValue) => {
    setSide(newValue);
  };
  // Hardcoded value for testing
  const marketName = "BTC-USDC";
  const baseCurrency = "BTC";
  const quoteCurrency = "USDC";
  const userBalance = useMemo(
    () => userAccount && userAccount.balance / USDC_DECIMALS,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userAccount, openDeposit, connected]
  ); // USDC

  useMemo(() => {
    if (!quoteSize || !marketState) {
      return;
    }
    setSlippage(
      marketState?.getSlippageEstimation(
        side,
        parseFloat(quoteSize) * USDC_DECIMALS
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteSize]);

  // handleChange functions
  // Quote Size
  const handleChangeQuoteSize = (e) => {
    if (!connected) {
      return notify({
        message: "Connect your wallet",
      });
    }
    const { value, valid } = checkTextFieldNumberInput(e);
    if (!valid) {
      return setQuoteSize("0");
    }
    if (!userBalance || value > userBalance * leverage || !markPrice) {
      return notify({
        message:
          "User does not have enough balance - Increase your leverage or deposit more collateral",
        variant: "error",
      });
    }
    setQuoteSize(value);
    // Convert to base size
    const newBaseSize = parseFloat(value) / markPrice;
    const newBaseSizeValid =
      !isNaN(newBaseSize) && isFinite(newBaseSize) ? newBaseSize : null;
    setBaseSize(newBaseSizeValid ? newBaseSize.toString() : "0");
  };

  // Base Size
  const handleChangeBaseSize = (e) => {
    if (!connected) {
      return notify({
        message: "Connect your wallet",
      });
    }
    if (!markPrice) {
      return;
    }
    const { value, valid } = checkTextFieldNumberInput(e);
    if (!valid) {
      return setBaseSize("0");
    }
    const newQuoteSize = parseFloat(value) * markPrice;
    const newQuoteSizeValid =
      !isNaN(newQuoteSize) && isFinite(newQuoteSize) ? newQuoteSize : null;
    if (!userBalance || newQuoteSize > userBalance * leverage || !markPrice) {
      notify({
        message:
          "User does not have enough balance - Increase your leverage or deposit more collateral",
        variant: "error",
      });
      return;
    }
    setBaseSize(value);
    // Convert to quote size
    setQuoteSize(newQuoteSizeValid ? newQuoteSize.toString() : "0");
  };
  // Reduce Only
  // Leverage
  const handleChangeLeverage = (leverage: number) => {
    setLeverage(leverage);
  };

  const onClick = async () => {
    if (!userBalance || !wallet || !userAccount) {
      return;
    }

    if (parseFloat(quoteSize) > userBalance * leverage) {
      notify({
        message: `Size too big - Max size is ${(
          userBalance * leverage
        ).toLocaleString()}`,
        variant: "error",
      });
      return;
    }

    try {
      const parsedSize = parseFloat(quoteSize) * USDC_DECIMALS;
      if (parsedSize <= 0) {
        notify({ message: "Size too small", variant: "error" });
        return;
      }
      setLoading(true);
      notify({ message: "Opening position..." });

      const tx = new Transaction();
      const [signers, instructions] = await createPosition(
        connection,
        side === 0 ? PositionType.Long : PositionType.Short,
        parsedSize,
        leverage,
        userAccount,
        referrer
      );
      tx.add(...instructions);
      await sendTransaction({
        transaction: tx,
        wallet: wallet,
        signers: signers,
        connection: connection,
        sendingMessage: "Opening position...",
      });
    } catch (err) {
      console.warn(`Error opening position - ${err}`);
      notify({ message: `Error opening position - ${err}`, variant: "error" });
    } finally {
      setLoading(false);
      refreshAllCaches();
    }
  };

  const expectedLiqPrice = roundToDecimal(
    marketState?.getLiquidationIndex(
      side === 0 ? PositionType.Long : PositionType.Short,
      parseFloat(baseSize) * USDC_DECIMALS,
      (parseFloat(quoteSize) * USDC_DECIMALS) / leverage
    ),
    2
  )?.toLocaleString();

  return (
    <FloatingCard>
      {/* Select Side */}
      <Grid container justify="center">
        <MouseOverPopOver
          popOverText={
            <>
              Positions and margins are isolated. <br />
              If you already have a position and want to change it use the{" "}
              <strong>EDIT</strong> button
            </>
          }
          textClassName={undefined}
        >
          <IsolatedPositionChip />
        </MouseOverPopOver>
      </Grid>
      <AppBar className={classes.AppBar} position="static" elevation={0}>
        <Tabs
          value={side}
          onChange={handleSetSide}
          centered
          classes={{
            indicator:
              side === 0 ? classes.buyIndicator : classes.sellIndicator,
          }}
        >
          <Tab
            label={`Buy ${marketName}`}
            className={classes.buyTab}
            style={{ marginRight: "3%" }}
          />
          <Tab
            label={`Sell ${marketName}`}
            className={classes.sellTab}
            style={{ marginLeft: "3%" }}
          />
        </Tabs>
      </AppBar>
      <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="flex-start"
        className={classes.sizeContainer}
      >
        <Grid item style={{ padding: 10, width: "90%" }}>
          <FormControl style={{ width: "100%" }}>
            <TextField
              style={{ width: "100%" }}
              value={baseSize}
              onChange={handleChangeBaseSize}
              inputProps={{
                className: classes.inputProps,
              }}
              InputLabelProps={{ shrink: true }}
              label={baseCurrency}
              type="number"
            />
          </FormControl>
        </Grid>
        <Grid item style={{ padding: 10, marginTop: 20, width: "90%" }}>
          <FormControl style={{ width: "100%" }}>
            <TextField
              value={quoteSize}
              onChange={handleChangeQuoteSize}
              inputProps={{
                className: classes.inputProps,
              }}
              InputLabelProps={{ shrink: true }}
              label={quoteCurrency}
              type="number"
            />
          </FormControl>
        </Grid>
      </Grid>

      {/* Set leverage */}
      <div className={classes.leverageContainer}>
        <Typography variant="body1" className={classes.whiteText}>
          Leverage: {leverage}x
        </Typography>
        <LeverageSlider
          value={leverage}
          onChange={(e, v) => handleChangeLeverage(v as number)}
          valueLabelDisplay="auto"
          max={MAX_LEVERAGE}
        />
      </div>
      {!!userBalance && !!leverage && (
        <div className={classes.maxPositionContainer}>
          <Typography
            variant="body1"
            className={classes.whiteText}
            style={{ opacity: 0.6, cursor: "pointer" }}
            onClick={() => {
              if (markPrice) {
                const value = Math.floor(leverage * userBalance);
                const valueString = value.toString();
                setQuoteSize(valueString);
                const newBaseSize = (value / markPrice).toString();
                setBaseSize(newBaseSize);
              }
            }}
          >
            Max position: {(leverage * userBalance).toLocaleString()}
          </Typography>
        </div>
      )}
      {!!slippage && (
        <div className={classes.maxPositionContainer}>
          <Typography
            variant="body1"
            className={classes.whiteText}
            style={{ opacity: 0.6 }}
          >
            Expected slippage: {`${roundToDecimal(slippage * 100, 3)}%`}
          </Typography>
        </div>
      )}
      {leverage > 1 && (
        <div className={classes.maxPositionContainer}>
          <Grid container justify="center" direction="column">
            {!!baseSize && !!quoteSize && expectedLiqPrice && (
              <Grid item>
                <Typography
                  variant="body1"
                  className={classes.whiteText}
                  style={{ opacity: 0.6 }}
                >
                  Expected liq. price: {expectedLiqPrice}
                </Typography>
              </Grid>
            )}
            <Grid item>
              <p className={classes.leverageWarning}>
                <Emoji emoji="⚠️" /> Trading on leverage involves a substantial
                risk of being liquidated
              </p>
            </Grid>
          </Grid>
        </div>
      )}
      {/* Submit Button */}
      <Grid container justify="center">
        {!!userAccount && userAccount.balance > 0 && (
          <Button
            disabled={loading}
            className={side === 0 ? classes.buyButton : classes.sellButton}
            onClick={connected ? onClick : connect}
          >
            <Typography
              className={classes.buttonText}
              color="primary"
              variant="body1"
            >
              {!connected ? (
                "Connect Wallet"
              ) : loading ? (
                <Spin size={20} />
              ) : side === 0 ? (
                "Buy/Long"
              ) : (
                "Sell/Short"
              )}
            </Typography>
          </Button>
        )}
        {!userAccount && connected && <CreateUserAccountButton />}
        {userAccount && userAccount?.balance === 0 && (
          <>
            <Button
              className={side === 0 ? classes.buyButton : classes.sellButton}
              onClick={() => setOpenDeposit(true)}
            >
              <Typography
                className={classes.buttonText}
                color="primary"
                variant="body1"
              >
                Deposit Collateral
              </Typography>
            </Button>
            <ModalAdd
              open={openDeposit}
              setOpen={setOpenDeposit}
              acc={userAccount.address}
            />
          </>
        )}
        {!connected && !userAccount && (
          <Button
            disabled={loading}
            className={side === 0 ? classes.buyButton : classes.sellButton}
            onClick={connect}
          >
            <Typography
              className={classes.buttonText}
              color="primary"
              variant="body1"
            >
              Connect Wallet
            </Typography>
          </Button>
        )}
      </Grid>
    </FloatingCard>
  );
};

export default TradeForm;
