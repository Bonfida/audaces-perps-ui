import React from "react";
import { OrderBook } from "@lab49/react-order-book";
import { useOrderbook } from "../hooks/useOrderbook";
import { MARKET } from "@audaces/perps";
import Spin from "./Spin";
import "../index.css";
import FloatingCard from "./FloatingCard";
import { makeStyles } from "@material-ui/core";
import { roundToDecimal } from "../utils/utils";
import { median } from "mathjs";

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

  const showSpread =
    book && book.asks && book.bids && book.asks[0] && book.bids[0];

  if (!orderbook || !orderbookLoaded || !book) {
    return (
      <div className={classes.spinningContainer}>
        <Spin size={40} />
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <FloatingCard>
        <div className={classes.root}>
          <span className={classes.title}>Orderbook</span>
          <OrderBook
            stylePrefix="Orderbook"
            book={book}
            fullOpacity
            interpolateColor={(color) => color}
            showSpread={showSpread}
            spread={
              showSpread
                ? roundToDecimal(
                    median(book!.asks![0][0]!, book!.bids![0][0]!),
                    3
                  )
                : null
            }
          />
        </div>
      </FloatingCard>
    </div>
  );
};

export default Orderbook;
