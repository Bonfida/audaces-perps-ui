import React, { useMemo } from "react";
import { TextField, FormControl, Button, Grid } from "@material-ui/core";
import { notify } from "../utils/notifications";
import { makeStyles } from "@material-ui/core/styles";
import { checkTextFieldNumberInput, roundToDecimal } from "../utils/utils";
import { useState } from "react";
import {
  Position,
  increasePositionBaseSize,
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
  confirmButton: {
    marginTop: 40,
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
});

const IncreasePositionDialog = ({ position }: { position: Position }) => {
  const classes = useStyles();
  const [size, setSize] = useState("0");
  const [loading, setLoading] = useState(false);
  const { wallet } = useWallet();
  const connection = useConnection();
  const markPrice = useMarkPrice();
  const { marketState } = useMarket();
  const referrer = useReferrer();

  const newBaseSize = useMemo(() => {
    if (
      (!parseFloat(size) && parseFloat(size) <= 0) ||
      !marketState?.coinDecimals
    ) {
      return null;
    }
    return roundToDecimal(
      parseFloat(size) + position.vCoinAmount / marketState?.coinDecimals,
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
        (parseFloat(size) + position.vCoinAmount / marketState?.coinDecimals)) /
        (position.collateral / marketState?.quoteDecimals)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markPrice, newBaseSize]);

  const onChangeSize = (e) => {
    const { value, valid } = checkTextFieldNumberInput(e);
    if (!valid) {
      return;
    }
    setSize(value);
  };

  const onClick = async () => {
    setLoading(true);
    notify({
      message: "Increasing position...",
    });
    try {
      if (
        !wallet.publicKey ||
        !size ||
        !markPrice ||
        !marketState?.coinDecimals
      ) {
        return;
      }

      const parsedSize = parseFloat(size) * marketState?.coinDecimals;

      const [, instructions] = await increasePositionBaseSize(
        connection,
        position,
        parsedSize,
        wallet.publicKey,
        referrer
      );

      await sendTransaction({
        transaction: new Transaction().add(...instructions),
        wallet: wallet,
        connection: connection,
      });

      notify({
        message: "Position increased",
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
              variant="outlined"
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
            {loading ? <Spin size={20} /> : "Increase Size"}
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

export default IncreasePositionDialog;
