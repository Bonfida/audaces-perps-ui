import React, { useMemo } from "react";
import { TextField, FormControl, Button, Grid } from "@material-ui/core";
import { notify } from "../utils/notifications";
import { makeStyles } from "@material-ui/core/styles";
import { checkTextFieldNumberInput, roundToDecimal } from "../utils/utils";
import { useState } from "react";
import {
  Position,
  reducePositionBaseSize,
  completeClosePosition,
  PositionType,
} from "@audaces/perps";
import { useConnection } from "../utils/connection";
import { useWallet } from "../utils/wallet";
import { sendTransaction } from "../utils/send";
import { Transaction } from "@solana/web3.js";
import Spin from "./Spin";
import { refreshAllCaches } from "../utils/fetch-loop";
import { useMarkPrice, useMarket } from "../utils/market";
import { UpdatedPosition } from "./SummaryPosition";
import { useReferrer } from "../utils/perpetuals";

const useStyles = makeStyles({
  modalTitle: {
    color: "white",
    opacity: 0.8,
    fontSize: 24,
    marginBottom: 10,
  },
  inputProps: {
    color: "white",
    fontSize: 20,
  },
  cancelButton: {
    marginTop: 20,
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
  text: {
    fontSize: 16,
    color: "white",
  },
  newSizeText: {
    fontSize: 20,
    color: "white",
    fontWeight: 400,
  },
  confirmButton: {
    marginTop: 20,
    marginBottom: 20,
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
  divider: {
    background: "#00ADB5",
    margin: 10,
  },
});

export const CompleteCloseDialog = ({ position }: { position: Position }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { wallet } = useWallet();
  const connection = useConnection();
  const referrer = useReferrer();

  const onClick = async () => {
    setLoading(true);
    notify({
      message: "Closing position...",
    });
    try {
      if (!wallet.publicKey) {
        return;
      }
      const tx = new Transaction();
      const [signers, instruction] = await completeClosePosition(
        connection,
        position,
        wallet.publicKey,
        referrer
      );
      tx.add(...instruction);
      await sendTransaction({
        transaction: tx,
        wallet: wallet,
        connection: connection,
        signers: signers,
      });

      notify({
        message: "Position closed",
        variant: "success",
      });
    } catch (err) {
      console.warn(err);
      notify({
        message: `Error closing position - ${err}`,
        variant: "error",
      });
    } finally {
      setLoading(false);
      refreshAllCaches();
    }
  };

  return (
    <>
      <Grid container justify="center" alignItems="center" spacing={4}>
        <Button
          disabled={loading}
          className={classes.confirmButton}
          onClick={onClick}
        >
          {loading ? <Spin size={20} /> : "Complete Close"}
        </Button>
      </Grid>
    </>
  );
};

export const PartialCloseDialog = ({ position }: { position: Position }) => {
  const classes = useStyles();
  const [size, setSize] = useState("0");
  const [loading, setLoading] = useState(false);
  const { wallet } = useWallet();
  const connection = useConnection();
  const markPrice = useMarkPrice();
  const referrer = useReferrer();
  const { marketState } = useMarket();

  const newBaseSize = useMemo(() => {
    if (
      (!parseFloat(size) && parseFloat(size) <= 0) ||
      !marketState?.coinDecimals
    ) {
      return null;
    }
    return roundToDecimal(
      -parseFloat(size) + position.vCoinAmount / marketState?.coinDecimals,
      5
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);
  const newLeverage = useMemo(() => {
    if (
      !newBaseSize ||
      !markPrice ||
      !marketState?.coinDecimals ||
      !marketState?.quoteDecimals
    ) {
      return null;
    }
    return Math.ceil(
      (markPrice *
        (-parseFloat(size) +
          position.vCoinAmount / marketState?.coinDecimals)) /
        (position.collateral / marketState?.quoteDecimals)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markPrice, newBaseSize]);

  const onChangeSize = (e) => {
    const { value, valid } = checkTextFieldNumberInput(e);
    if (!valid || !marketState?.coinDecimals || !marketState?.coinDecimals) {
      return;
    }
    if (parseFloat(value) > position.vCoinAmount / marketState?.coinDecimals) {
      notify({
        message: `Size too large - max ${
          position.vCoinAmount / marketState?.coinDecimals
        }`,
      });
      return;
    }
    setSize(value);
  };

  const onClick = async () => {
    setLoading(true);
    notify({
      message: "Closing position...",
    });
    try {
      if (!wallet.publicKey || !size || !marketState?.coinDecimals) {
        return;
      }
      let parsedSize = parseFloat(size) * marketState?.coinDecimals;
      if (isNaN(parsedSize) || !isFinite(parsedSize) || parsedSize <= 0) {
        return notify({ message: "Invalid size" });
      }
      // Close the position completely
      if (parsedSize >= position.vCoinAmount) {
        const tx = new Transaction();
        const [signers, instruction] = await completeClosePosition(
          connection,
          position,
          wallet.publicKey,
          referrer
        );
        tx.add(...instruction);
        await sendTransaction({
          transaction: tx,
          wallet: wallet,
          connection: connection,
          signers: signers,
        });
        return notify({
          message: "Position reduced",
          variant: "success",
        });
      }
      const tx = new Transaction();
      const [signers, instruction] = await reducePositionBaseSize(
        connection,
        position,
        parsedSize,
        wallet.publicKey,
        referrer
      );
      tx.add(...instruction);
      await sendTransaction({
        transaction: tx,
        wallet: wallet,
        connection: connection,
        signers: signers,
      });

      notify({
        message: "Position reduced",
        variant: "success",
      });
    } catch (err) {
      console.warn(err);
      notify({
        message: `Error closing position - ${err}`,
        variant: "error",
      });
    } finally {
      setLoading(false);
      refreshAllCaches();
    }
  };

  return (
    <>
      <Grid container justify="center" alignItems="center" spacing={4}>
        <Grid item>
          <FormControl>
            <TextField
              value={size}
              onChange={onChangeSize}
              inputProps={{
                className: classes.inputProps,
              }}
              InputLabelProps={{ shrink: true }}
              label="Base Size"
            />
          </FormControl>
        </Grid>
        <Grid item>
          <Button
            disabled={loading || !parseFloat(size)}
            className={classes.confirmButton}
            onClick={onClick}
          >
            {loading ? <Spin size={20} /> : "Partial Close"}
          </Button>
        </Grid>
      </Grid>
      {!!marketState?.quoteDecimals && (
        <UpdatedPosition
          baseSize={newBaseSize}
          leverage={newLeverage}
          collateral={position.collateral / marketState?.quoteDecimals}
          slippage={
            !!markPrice
              ? marketState?.getSlippageEstimation(
                  position.side === "short"
                    ? PositionType.Short
                    : PositionType.Long,
                  parseFloat(size) * markPrice * marketState.quoteDecimals
                )
              : undefined
          }
        />
      )}
    </>
  );
};
