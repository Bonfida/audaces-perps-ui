import React from "react";
import FloatingCard from "./FloatingCard";
import { makeStyles } from "@material-ui/core";
import OrderbookInner from "./OrderbookInner";

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    overflow: "auto",
  },
  title: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    marginBottom: 20,
  },
  spinningContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const Orderbook = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <FloatingCard>
        <div className={classes.root}>
          <span className={classes.title}>Orderbook</span>
          <OrderbookInner
            smallScreen={false}
            depth={10}
            onPrice={() => console.log()}
            onSize={() => console.log()}
          />
        </div>
      </FloatingCard>
    </div>
  );
};

export default Orderbook;
