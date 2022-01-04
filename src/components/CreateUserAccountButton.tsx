import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button } from "@material-ui/core";
import { useAvailableCollateral } from "../utils/perpetuals";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { notify } from "../utils/notifications";
import {
  createAssociatedTokenAccount,
  createUserAccount,
} from "@audaces/perps";
import { useMarket } from "../utils/market";
import Spin from "./Spin";
import { USDC_MINT, sleep } from "../utils/utils";
import { sendTx } from "../utils/send";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  buyButton: {
    background: "#4EDC76",
    maxWidth: 300,
    width: "100%",
    color: "#141722",
    fontSize: 14,
    fontWeight: 800,
    "&:hover": {
      cursor: "pointer",
      background: "#4EDC76",
      maxWidth: 300,
      width: "100%",
      color: "#141722",
      fontSize: 14,
      fontWeight: 800,
    },
  },
});

const CreateUserAccountButton = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [collateral] = useAvailableCollateral();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { marketAddress, setRefreshUserAccount } = useMarket();

  const onClickCreate = async () => {
    if (!publicKey) return;
    try {
      setLoading(true);
      if (!collateral?.collateralAddress) {
        notify({
          message: "You don't have USDC in your wallet.",
          variant: "error",
        });
        return;
      }
      const collateralInfo = await connection.getAccountInfo(
        collateral?.collateralAddress
      );
      if (!collateralInfo?.data) {
        notify({ message: "Creating collateral account" });
        const createAccountInstructions = await createAssociatedTokenAccount(
          publicKey,
          publicKey,
          USDC_MINT
        );
        await sendTx(
          connection,
          publicKey,
          [createAccountInstructions],
          sendTransaction
        );
      }
      notify({
        message: "Creating trading account...",
      });

      const [signers, instructions] = await createUserAccount(
        connection,
        marketAddress,
        publicKey
      );
      await sendTx(connection, publicKey, instructions, sendTransaction, {
        signers,
      });

      notify({
        message: "Account created",
        variant: "success",
      });
    } catch (err) {
      console.warn(err);
      notify({
        message: `Error creating account - ${err}`,
        variant: "error",
      });
    } finally {
      await sleep(5_000);
      setRefreshUserAccount((prev) => !prev);
      setLoading(false);
    }
  };

  return (
    <>
      <Grid container justify="center">
        <Button
          disabled={loading}
          onClick={onClickCreate}
          className={classes.buyButton}
        >
          {loading ? <Spin size={20} /> : "Create Trading Account"}
        </Button>
      </Grid>
    </>
  );
};

export default CreateUserAccountButton;
