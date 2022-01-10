import React from "react";
import { OrderBook } from "@lab49/react-order-book";
import { useOrderbook } from "../hooks/useOrderbook";
import { MARKET } from "@audaces/perps";
import Spin from "./Spin";
import "../index.css";
import FloatingCard from "./FloatingCard";
import { makeStyles } from "@material-ui/core";
import { roundToDecimal } from "../utils/utils";

const useStyles = makeStyles({
  root: {
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    marginBottom: 20,
  },
});

const Orderbook = () => {
  const classes = useStyles();
  const [orderbook, orderbookLoaded] = useOrderbook(MARKET); // TODO change

  const decimals = Math.pow(10, 6);
  const priceTick = 2;
  const sizeTick = 3;

  const book = {
    asks: orderbook?.asks.map((e) => [
      roundToDecimal(e.price / Math.pow(2, 32), priceTick),
      roundToDecimal(e.size / decimals, sizeTick),
    ]),
    bids: orderbook?.bids.map((e) => [
      roundToDecimal(e.price / Math.pow(2, 32), priceTick),
      roundToDecimal(e.size / decimals, sizeTick),
    ]),
  };

  if (!orderbook || !orderbookLoaded || !book) {
    return <Spin size={20} />;
  }
  return (
    <div className={classes.root}>
      <FloatingCard>
        <span className={classes.title}>Orderbook</span>
        <OrderBook
          stylePrefix="Orderbook"
          book={book}
          fullOpacity
          interpolateColor={(color) => color}
          showSpread={false}
          spread=""
        />
      </FloatingCard>
    </div>
  );
};

export default Orderbook;
