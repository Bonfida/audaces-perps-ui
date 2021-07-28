import React, { useMemo } from "react";
import { TextField, FormControl, Button, Grid } from "@material-ui/core";
import { notify } from "../utils/notifications";
import { makeStyles } from "@material-ui/core/styles";
import { checkTextFieldNumberInput, roundToDecimal } from "../utils/utils";
import { useState } from "react";
import { Transaction } from "@solana/web3.js";
import { Position, increasePositionCollateral } from "@audaces/perps";
import { useWallet } from "../utils/wallet";
import { useConnection } from "../utils/connection";
import { sendTransaction } from "../utils/send";
import Spin from "./Spin";
import { refreshAllCaches } from "../utils/fetch-loop";
import { UpdatedPosition } from "./SummaryPosition";
import { useMarkPrice, useMarket } from "../utils/market";

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
  addButton: {
    marginTop: 20,
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
  newSizeText: {
    fontSize: 20,
    color: "white",
    fontWeight: 400,
  },
});

const AddCollateralDialog = ({ position }: { position: Position }) => {
  const classes = useStyles();
  const connection = useConnection();
  const { wallet } = useWallet();
  const [collateral, setCollateral] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const markPrice = useMarkPrice();
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
      (markPrice * (position.vCoinAmount / marketState.coinDecimals)) /
        (position.collateral / marketState?.quoteDecimals + collateral)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collateral]);

  const newCollateral = useMemo(() => {
    if (!collateral || !marketState?.quoteDecimals) {
      return null;
    }
    return roundToDecimal(
      position.collateral / marketState?.quoteDecimals + collateral,
      3
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collateral]);

  const onChangeCollateral = (e) => {
    const { value, valid } = checkTextFieldNumberInput(e);
    if (!valid) {
      notify({ message: "Invalid amoount", variant: "error" });
      return;
    }
    setCollateral(parseFloat(value) || null);
  };

  const onClick = async () => {
    if (!wallet || !collateral || !marketState?.quoteDecimals) {
      return;
    }
    notify({
      message: "Adding collateral...",
    });
    try {
      setLoading(true);
      const [signers, instructions] = await increasePositionCollateral(
        connection,
        position,
        wallet.publicKey,
        collateral * marketState?.quoteDecimals
      );
      await sendTransaction({
        connection: connection,
        wallet: wallet,
        signers: signers,
        transaction: new Transaction().add(...instructions),
      });
      notify({
        message: "Collateral added",
        variant: "success",
      });
      refreshAllCaches();
    } catch (err) {
      console.warn(err);
      notify({
        message: `Error adding collateral - ${err}`,
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
              value={collateral}
              onChange={onChangeCollateral}
              inputProps={{
                className: classes.inputProps,
              }}
              InputLabelProps={{ shrink: true }}
              label="New Collateral"
            />
          </FormControl>
        </Grid>
        <Grid>
          <Button
            disabled={loading || !wallet || !collateral}
            onClick={onClick}
            className={classes.addButton}
          >
            {loading ? <Spin size={20} /> : "Add"}
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

export default AddCollateralDialog;
