import React, { useMemo } from "react";
import { TextField, FormControl, Button, Grid } from "@material-ui/core";
import { notify } from "../utils/notifications";
import { makeStyles } from "@material-ui/core/styles";
import { checkTextFieldNumberInput, roundToDecimal } from "../utils/utils";
import { useState } from "react";
import { reducePositionCollateral, Position } from "@audaces/perps";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Spin from "./Spin";
import { refreshAllCaches } from "../utils/fetch-loop";
import { UpdatedPosition } from "./SummaryPosition";
import { useMarkPrice, useMarket } from "../utils/market";
import { useReferrer } from "../utils/perpetuals";
import { sendTx } from "../utils/send";

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
  removeButton: {
    background: "#EB5252",
    maxWidth: 300,
    width: "100%",
    border: "1px solid",
    color: "#141722",
    fontSize: 14,
    fontWeight: 800,
    borderColor: "transparent",
    "&:hover": {
      cursor: "pointer",
      background: "#EB5252",
      maxWidth: 300,
      width: "100%",
      color: "#141722",
      fontSize: 14,
      fontWeight: 800,
    },
  },
});

const RemoveCollateralDialog = ({ position }: { position: Position }) => {
  const classes = useStyles();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [collateral, setCollateral] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const markPrice = useMarkPrice();
  const referrer = useReferrer();
  const { marketState } = useMarket();

  const newLeverage = useMemo(() => {
    if (
      !markPrice ||
      !collateral ||
      !marketState?.coinDecimals ||
      !marketState?.quoteDecimals
    ) {
      return null;
    }
    return Math.ceil(
      (markPrice * (position.vCoinAmount / marketState?.coinDecimals)) /
        (position.collateral / marketState?.quoteDecimals - collateral)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collateral]);

  const newCollateral = useMemo(() => {
    if (!collateral || !marketState?.quoteDecimals) {
      return null;
    }
    return roundToDecimal(
      position.collateral / marketState?.quoteDecimals - collateral,
      3
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collateral]);

  const onChangeCollateral = (e) => {
    const { value, valid } = checkTextFieldNumberInput(e);
    if (!valid || !marketState?.quoteDecimals || !marketState?.quoteDecimals) {
      notify({ message: "Invalid amoount", variant: "error" });
      return;
    }
    if (value > position.collateral / marketState?.quoteDecimals) {
      return notify({
        message: `Max collateral ${
          position.collateral / marketState?.quoteDecimals
        }`,
      });
    }
    setCollateral(value);
  };

  const onClick = async () => {
    if (!publicKey || !collateral || !marketState?.quoteDecimals) {
      return;
    }
    notify({
      message: "Removing collateral...",
    });
    try {
      setLoading(true);
      const [signers, instructions] = await reducePositionCollateral(
        connection,
        position,
        publicKey,
        collateral * marketState?.quoteDecimals,
        referrer
      );

      await sendTx(connection, publicKey, instructions, sendTransaction, {
        signers,
      });

      notify({
        message: "Collateral removed",
        variant: "success",
      });
      refreshAllCaches();
    } catch (err) {
      console.warn(err);
      notify({
        message: `Error removing collateral - ${err}`,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Grid
        container
        justify="center"
        alignItems="center"
        spacing={5}
        style={{ marginTop: "5%" }}
      >
        <Grid item>
          <FormControl>
            <TextField
              variant="outlined"
              value={collateral}
              onChange={onChangeCollateral}
              inputProps={{
                className: classes.inputProps,
              }}
              InputLabelProps={{ shrink: true }}
              label="Collateral to remove"
            />
          </FormControl>
        </Grid>
        <Grid>
          <Button
            disabled={loading || !publicKey || !collateral}
            onClick={onClick}
            className={classes.removeButton}
          >
            {loading ? <Spin size={20} /> : "Remove"}
          </Button>
        </Grid>
      </Grid>
      {!!marketState?.coinDecimals && (
        <UpdatedPosition
          baseSize={position.vCoinAmount / marketState?.coinDecimals}
          leverage={newLeverage}
          collateral={newCollateral}
        />
      )}
    </>
  );
};

export default RemoveCollateralDialog;
