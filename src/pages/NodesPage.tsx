import React from "react";
import { Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
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

      <Counter />
    </>
  );
};

export default NodesPage;
