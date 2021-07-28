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
import {
  PositionType,
  createPosition,
  completeClosePosition,
  increasePosition,
  getDiscountAccount,
  reducePositionBaseSize,
} from "@audaces/perps";
import {
  checkTextFieldNumberInput,
  roundToDecimal,
  BNB_ADDRESS,
} from "../utils/utils";
import { useConnection } from "../utils/connection";
import { Transaction, Keypair, TransactionInstruction } from "@solana/web3.js";
import { useMarket, useMarkPrice, MAX_LEVERAGE } from "../utils/market";
import { useWallet } from "../utils/wallet";
import { sendTransaction } from "../utils/send";
import Spin from "./Spin";
import { refreshAllCaches } from "../utils/fetch-loop";
import { IsolatedPositionChip } from "./Chips";
import MouseOverPopOver from "./MouseOverPopOver";
import { useReferrer, useOpenPositions } from "../utils/perpetuals";
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
    fontSize: 16,
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
  const { userAccount, marketState, useIsolatedPositions, marketName } =
    useMarket();
  const connection = useConnection();
  const { wallet, connected, connect } = useWallet();
  const markPrice = useMarkPrice();
  const [slippage, setSlippage] = useState<null | number>(null);
  const referrer = useReferrer();
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openPositions] = useOpenPositions();

  const handleSetSide = (event, newValue) => {
    setSide(newValue);
  };

  const baseCurrency = marketName.split("-")[0];
  const quoteCurrency = "USDC";

  const userBalance = useMemo(
    () =>
      userAccount &&
      !!marketState?.quoteDecimals &&
      userAccount.balance / marketState?.quoteDecimals,
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
        parseFloat(quoteSize) * marketState.quoteDecimals
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteSize]);

  const currentPosition = openPositions?.find(
    (p) => p.marketAddress.toBase58() === userAccount?.market.toBase58()
  );

  const isSameSide = (side === 0 ? "long" : "short") === currentPosition?.side;
  const currentSize = currentPosition?.vCoinAmount || 0;
  const canModifyPosition = currentPosition && !useIsolatedPositions;
  const canDecrease = canModifyPosition && !isSameSide;
  const canIncrease = canModifyPosition && isSameSide;
  const canOpenPosition = useIsolatedPositions || !currentPosition;

  const positionPercentage =
    Math.floor(
      (parseFloat(baseSize) /
        // @ts-ignore (Can't be null)
        (currentPosition?.vCoinAmount / marketState?.coinDecimals)) *
        100
    ) || 0;

  // handleChange functions
  // Quote Size
  const handleChangeQuoteSize = (e) => {
    if (!connected) {
      return notify({
        message: "Connect your wallet",
      });
    }
    const { value, valid } = checkTextFieldNumberInput(e);
    if (!valid || !marketState?.quoteDecimals) {
      return setQuoteSize("0");
    }
    if (
      !userBalance ||
      ((canOpenPosition || canIncrease) && value > userBalance * leverage) ||
      !markPrice
    ) {
      return notify({
        message:
          "User does not have enough balance - Increase your leverage or deposit more collateral",
        variant: "error",
      });
    }
    if (
      canDecrease &&
      value > (currentSize * markPrice) / marketState?.quoteDecimals
    ) {
      return notify({
        message: "Amount is too big compared to position size",
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
    if (!markPrice || !marketState?.coinDecimals) {
      return;
    }
    const { value, valid } = checkTextFieldNumberInput(e);
    if (!valid) {
      return setBaseSize("0");
    }
    const newQuoteSize = parseFloat(value) * markPrice;
    const newQuoteSizeValid =
      !isNaN(newQuoteSize) && isFinite(newQuoteSize) ? newQuoteSize : null;
    if (
      !userBalance ||
      ((canOpenPosition || canIncrease) &&
        newQuoteSize > userBalance * leverage) ||
      !markPrice
    ) {
      return notify({
        message:
          "User does not have enough balance - Increase your leverage or deposit more collateral",
        variant: "error",
      });
    }
    if (canDecrease && value > currentSize / marketState?.coinDecimals) {
      return notify({
        message: "Amount is too big compared to position size",
        variant: "error",
      });
    }
    setBaseSize(value);
    // Convert to quote size
    setQuoteSize(newQuoteSizeValid ? newQuoteSize.toString() : "0");
  };

  // Leverage
  const handleChangeLeverage = (leverage: number) => {
    setLeverage(leverage);
  };

  // Create a position
  const onClick = async () => {
    if (
      !userBalance ||
      !wallet ||
      !userAccount ||
      !marketState?.quoteDecimals
    ) {
      return;
    }

    // Open a new position
    if (canOpenPosition) {
      if (parseFloat(quoteSize) < 5) {
        return notify({ message: "Min order size is 5 USDC" });
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
        const parsedSize = parseFloat(quoteSize) * marketState?.quoteDecimals;
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
        return await sendTransaction({
          transaction: tx,
          wallet: wallet,
          signers: signers,
          connection: connection,
          sendingMessage: "Opening position...",
        });
      } catch (err) {
        console.warn(`Error opening position - ${err}`);
        notify({
          message: `Error opening position - ${err}`,
          variant: "error",
        });
      } finally {
        setLoading(false);
        refreshAllCaches();
      }
    }

    if (!currentPosition) return;

    // Increase current position
    if (canIncrease) {
      try {
        if (parseFloat(quoteSize) < 5) {
          return notify({ message: "Min order size is 5 USDC" });
        }
        setLoading(true);
        const tx = new Transaction();
        const [signers, instructions] = await increasePosition(
          connection,
          currentPosition.marketAddress,
          (parseFloat(quoteSize) * marketState?.quoteDecimals) / leverage,
          leverage,
          currentPosition.positionIndex,
          userAccount.owner,
          userAccount.address,
          BNB_ADDRESS,
          await getDiscountAccount(connection, wallet.publicKey),
          wallet.publicKey,
          referrer
        );
        tx.add(...instructions);
        return await sendTransaction({
          transaction: tx,
          wallet: wallet,
          signers: signers,
          connection: connection,
          sendingMessage: "Increasing position...",
        });
      } catch (err) {
        console.warn(`Error increasing position ${err}`);
        notify({
          message: `Error increasing position ${err}`,
          variant: "error",
        });
      } finally {
        setLoading(false);
        refreshAllCaches();
      }
    }

    // Decrease current position
    if (canDecrease) {
      try {
        setLoading(true);
        const _size = parseFloat(baseSize) * marketState?.coinDecimals;
        const tx = new Transaction();
        let signers: Keypair[] = [];
        let instructions: TransactionInstruction[] = [];
        if (_size === currentPosition.size) {
          [signers, instructions] = await completeClosePosition(
            connection,
            currentPosition,
            wallet.publicKey,
            referrer
          );
        } else {
          [signers, instructions] = await reducePositionBaseSize(
            connection,
            currentPosition,
            _size,
            wallet.publicKey,
            referrer
          );
        }
        tx.add(...instructions);
        return await sendTransaction({
          transaction: tx,
          wallet: wallet,
          signers: signers,
          connection: connection,
          sendingMessage: "Decreasing position...",
        });
      } catch (err) {
        console.warn(`Error decreasing position ${err}`);
        notify({
          message: `Error decreasing position ${err}`,
          variant: "error",
        });
      } finally {
        setLoading(false);
        refreshAllCaches();
      }
    }
  };

  const expectedLiqPrice = roundToDecimal(
    marketState?.getLiquidationIndex(
      side === 0 ? PositionType.Long : PositionType.Short,
      parseFloat(baseSize) * marketState.coinDecimals,
      (parseFloat(quoteSize) * marketState.quoteDecimals) / leverage
    ),
    2
  )?.toLocaleString();

  return (
    <FloatingCard>
      {/* Select Side */}
      {useIsolatedPositions && (
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
      )}
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
      {(canIncrease || canOpenPosition) && (
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
      )}
      {/* Position Size */}
      {canDecrease && (
        <div className={classes.leverageContainer}>
          <Typography variant="body1" className={classes.whiteText}>
            Position Size: {positionPercentage}%
          </Typography>
          <LeverageSlider
            value={positionPercentage}
            onChange={(e, v) => {
              if (markPrice && currentPosition && !!marketState?.coinDecimals) {
                const baseSize =
                  ((v as number) *
                    (currentPosition?.vCoinAmount /
                      marketState?.coinDecimals)) /
                  100;
                setBaseSize(baseSize.toString());
                setQuoteSize((baseSize * markPrice).toString());
              }
            }}
            valueLabelDisplay="auto"
            max={100}
          />
        </div>
      )}
      {!!userBalance && !!leverage && (canIncrease || canOpenPosition) && (
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
      {!!slippage && markPrice && (
        <div className={classes.maxPositionContainer}>
          <Typography
            variant="body1"
            className={classes.whiteText}
            style={{ opacity: 0.6 }}
          >
            Expected entry price:{" "}
            {`${roundToDecimal(
              markPrice * (1 + (side === 0 ? 1 : -1) * slippage),
              2
            )?.toLocaleString()}`}
          </Typography>
        </div>
      )}
      {leverage > 1 && canOpenPosition && (
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
              ) : canDecrease ? (
                "Close"
              ) : canIncrease && isSameSide ? (
                "Increase"
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
