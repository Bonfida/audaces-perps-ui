import React, { useState } from "react";
import { Button, Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { notify } from "../utils/notifications";
import { useConnection } from "../utils/connection";
import { useWallet } from "../utils/wallet";
import { crankLiquidation, crankFunding } from "@audaces/perps";
import { useMarket } from "../utils/market";
import { sendSignedTransaction, signTransactions } from "../utils/send";
import { Transaction } from "@solana/web3.js";
import Spin from "../components/Spin";
import { useAvailableCollateral } from "../utils/perpetuals";
import { useLocalStorageState } from "../utils/utils";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  button: {
    color: "white",
    background: "transparent",
    width: "auto",
    borderRadius: 5,
    height: "50px",
    border: "2px solid",
    borderColor: "#00ADB5",
    fontSize: 20,
    padding: 20,
  },
  h1: {
    fontSize: "max(5vw, 60px)",
    fontWeight: 400,
    color: "white",
    opacity: 0.8,
    marginTop: "5%",
    textTransform: "capitalize",
  },
  h2: {
    fontSize: "max(3vw, 40px)",
    fontWeight: 400,
    color: "white",
    opacity: 0.8,
    marginTop: "2%",
    marginBottom: "2%",
  },
  text: {
    fontSize: "max(1vw, 18px)",
    color: "white",
    opacity: 0.6,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: "10%",
    marginRight: "10%",
  },
  imgNode: {
    height: 250,
  },
  counter: {
    fontSize: 100,
    color: "white",
    opacity: 0.75,
  },
});

const LiquidationButton = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const { marketAddress } = useMarket();
  const [nbCranked, setNbCranked] = useLocalStorageState("nbCranked", 0);

  const onClick = async () => {
    if (!connected || !wallet?.publicKey) {
      notify({
        message: "Connect your wallet",
      });
      return;
    }

    try {
      setLoading(true);
      const [, instructions] = await crankLiquidation(
        connection,
        wallet?.publicKey,
        marketAddress
      );
      const signed = await signTransactions({
        transactionsAndSigners: instructions.map((i) => {
          return { transaction: new Transaction().add(i) };
        }),
        connection: connection,
        wallet: wallet,
      });

      for (let signedTransaction of signed) {
        await sendSignedTransaction({ signedTransaction, connection });
      }
      setNbCranked(nbCranked + 1);
    } catch (err) {
      if (err.message.includes("no-op")) {
        return notify({
          message: `No liquidation to crank`,
          variant: "success",
        });
      }
      console.warn(`Error - ${err}`);
      notify({
        message: `Error cranking transaction - ${err}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading} onClick={onClick} className={classes.button}>
      {loading ? <Spin size={20} /> : "Crank Liquidation"}
    </Button>
  );
};

const FundingButton = () => {
  const classes = useStyles();
  const connection = useConnection();
  const [loading, setLoading] = useState(false);
  const { wallet, connected } = useWallet();
  const { marketAddress } = useMarket();
  const [collateral] = useAvailableCollateral();
  const [nbCranked, setNbCranked] = useLocalStorageState("nbCranked", 0);

  const onClick = async () => {
    if (!connected || !collateral?.collateralAddress) {
      notify({
        message: "Connect your wallet",
      });
      return;
    }
    try {
      setLoading(true);
      const [, instructions] = await crankFunding(connection, marketAddress);
      const signed = await signTransactions({
        transactionsAndSigners: instructions.map((i) => {
          return { transaction: new Transaction().add(i) };
        }),
        connection: connection,
        wallet: wallet,
      });

      for (let signedTransaction of signed) {
        await sendSignedTransaction({ signedTransaction, connection });
      }
      setNbCranked(nbCranked + 1);
    } catch (err) {
      if (err.message.includes("no-op")) {
        return notify({ message: `No funding to crank`, variant: "success" });
      }
      console.warn(`Error - ${err}`);
      notify({
        message: `Error cranking transaction - ${err}`,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button onClick={onClick} className={classes.button}>
      {loading ? <Spin size={20} /> : "Crank Funding"}
    </Button>
  );
};

const CrankingButtons = () => {
  return (
    <Grid spacing={5} container justify="center" alignItems="center">
      <Grid item>
        <LiquidationButton />
      </Grid>
      <Grid item>
        <FundingButton />
      </Grid>
    </Grid>
  );
};

const Banner = () => {
  const classes = useStyles();
  return (
    <Typography variant="h1" align="center" className={classes.h1}>
      Nodes
    </Typography>
  );
};

const Text = () => {
  const classes = useStyles();
  return (
    <>
      <Grid container justify="center" alignItems="center" direction="column">
        <Grid item>
          <Typography align="center" variant="h2" className={classes.h2}>
            What are nodes?
          </Typography>
          <Typography align="center" variant="body1" className={classes.text}>
            Perpetual nodes secure the protocol by cranking liquidations and
            updating funding rates. Anyone can run a node and help secure the
            protocol
          </Typography>
        </Grid>
        <Grid item>
          <Typography align="center" variant="h2" className={classes.h2}>
            Set up your node
          </Typography>
          <Typography align="center" variant="body1" className={classes.text}>
            Anyone can set up a node and start cranking! Cranking can be done
            using the JavaScript SDK available on NPM or a Rust executable
            available on Github.
          </Typography>
        </Grid>
        <Grid item>
          <Typography align="center" variant="h2" className={classes.h2}>
            Crank manually
          </Typography>
          <Typography align="center" variant="body1" className={classes.text}>
            You can crank liquidations and funding rates manually and try
            earning a rewards!
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

const Counter = () => {
  const classes = useStyles();
  const [nbCranked] = useLocalStorageState("nbCranked", 0);
  if (nbCranked > 0) {
    return (
      <>
        <Typography align="center" className={classes.h2}>
          Transactions Cranked:
        </Typography>
        <Typography align="center" className={classes.counter}>
          {nbCranked}
        </Typography>
      </>
    );
  }
  return null;
};

const NodesPage = () => {
  return (
    <>
      <Banner />
      <Text />
      <CrankingButtons />
      <Counter />
    </>
  );
};

export default NodesPage;
