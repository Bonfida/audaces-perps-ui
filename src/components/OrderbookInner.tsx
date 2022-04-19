import React, { useRef, useEffect, useState } from "react";
import { isEqual, roundToDecimal } from "../utils/utils";
import { makeStyles } from "@material-ui/core";
import { usePrevious } from "../hooks/usePrevious";
import { useInterval } from "../hooks/useInterval";
import { useOrderbook } from "../hooks/useOrderbook";
import { useMarket } from "../contexts/market";
import { useMarkPrice } from "../hooks/useMarkPrice";
import FloatingCard from "./FloatingCard";
import { Price } from "@bonfida/aob";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import "../index.css";
import { Side } from "@audaces/perps";
import { PublicKey } from "@solana/web3.js";

const bidColor = "rgba(65, 199, 122, 0.6)";
const askColor = "rgba(242, 60, 105, 0.6)";

const useStyles = (arg) =>
  makeStyles({
    title: {
      color: "rgba(255, 255, 255, 1)",
    },
    sizeTitle: {
      padding: "20px 0 14px",
      color: "rgba(255, 255, 255, 1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    markPriceTitle: {
      padding: "20px 0 14px",
      fontWeight: 700,
    },
    line: {
      textAlign: "right",
      float: "right",
      height: "100%",
      width: arg["data-width"],
      backgroundColor: arg["data-bgcolor"],
    },
    price: {
      marginRight: 5,
      color: "white",
      fontWeight: 800,
    },
    white: {
      color: "rgba(255, 255, 255, 1)",
    },
    row: {
      display: "flex",
      align: "center",
      justifyContent: "space-between",
    },
    arrow: {
      margin: 0,
      fontSize: 16,
    },
    markPriceContainer: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
    },
    formattedMarkPrice: {
      marginTop: 2,
    },
  });

interface ICumulative {
  price: number;
  size: number;
  cumulativeSize: number;
  sizePercent: number;
}

export default function Orderbook({
  smallScreen,
  depth = 7,
  onPrice,
  onSize,
}: {
  smallScreen: boolean;
  depth: number;
  onPrice: () => void;
  onSize: () => void;
}) {
  const classes = useStyles({})();
  const { currentMarket } = useMarket();
  const [markPrice] = useMarkPrice(new PublicKey(currentMarket.address));
  const [orderbook] = useOrderbook(new PublicKey(currentMarket.address));
  console.log(orderbook);
  //   const { baseCurrency, quoteCurrency } = useMarket();

  const currentOrderbookData = useRef<{
    bids: Price[] | undefined;
    asks: Price[] | undefined;
  } | null>(null);
  const lastOrderbookData = useRef<{
    bids: Price[] | undefined;
    asks: Price[] | undefined;
  } | null>(null);

  const [orderbookData, setOrderbookData] = useState<{
    bids: ICumulative[];
    asks: ICumulative[];
  } | null>(null);

  useInterval(() => {
    if (
      !currentOrderbookData.current ||
      JSON.stringify(currentOrderbookData.current) !==
        JSON.stringify(lastOrderbookData.current)
    ) {
      let bids = orderbook?.bids || [];
      let asks = orderbook?.asks || [];

      let sum = (total: number, price: Price, index: number) =>
        index < depth ? total + price.size : total;
      let totalSize = bids.reduce(sum, 0) + asks.reduce(sum, 0);

      let bidsToDisplay = getCumulativeOrderbookSide(bids, totalSize, false);
      let asksToDisplay = getCumulativeOrderbookSide(asks, totalSize, true);

      currentOrderbookData.current = {
        bids: orderbook?.bids,
        asks: orderbook?.asks,
      };

      setOrderbookData({ bids: bidsToDisplay, asks: asksToDisplay });
    }
  }, 250);

  useEffect(() => {
    lastOrderbookData.current = {
      bids: orderbook?.bids,
      asks: orderbook?.asks,
    };
  }, [orderbook]);

  function getCumulativeOrderbookSide(
    orders: Price[],
    totalSize: number,
    backwards = false
  ) {
    let cumulative = orders
      .slice(0, depth)
      .reduce((cumulative: ICumulative[], price: Price, i: number) => {
        const cumulativeSize =
          (cumulative[i - 1]?.cumulativeSize || 0) + price.size;
        cumulative.push({
          price: price.price,
          size: price.size,
          cumulativeSize,
          sizePercent: Math.round((cumulativeSize / (totalSize || 1)) * 100),
        });
        return cumulative;
      }, []);
    if (backwards) {
      cumulative = cumulative.reverse();
    }
    return cumulative;
  }

  const baseCurrency = "BTC";
  const quoteCurrency = "USDC";

  return (
    <FloatingCard>
      <div className={classes.sizeTitle}>
        <span>Size ({baseCurrency})</span>
        <span>Price ({quoteCurrency})</span>
      </div>
      {orderbookData?.asks.map(({ price, size, sizePercent }) => (
        <OrderbookRow
          key={price + ""}
          price={price}
          size={size}
          side={Side.Ask}
          sizePercent={sizePercent}
          onPriceClick={() => onPrice()}
          onSizeClick={() => onSize()}
        />
      ))}
      <MarkPriceComponent markPrice={markPrice} />
      {orderbookData?.bids.map(({ price, size, sizePercent }) => (
        <OrderbookRow
          key={price + ""}
          price={price}
          size={size}
          side={Side.Bid}
          sizePercent={sizePercent}
          onPriceClick={() => onPrice()}
          onSizeClick={() => onSize()}
        />
      ))}
    </FloatingCard>
  );
}

const OrderbookRow = React.memo(
  ({
    side,
    price,
    size,
    sizePercent,
    onSizeClick,
    onPriceClick,
  }: {
    side: Side;
    price: number;
    size: number;
    sizePercent: number;
    onSizeClick: () => void;
    onPriceClick: () => void;
  }) => {
    const classes = useStyles({
      "data-bgcolor": side === Side.Bid ? bidColor : askColor,
      "data-width": sizePercent + "%",
    })();
    const element = React.useRef() as React.MutableRefObject<HTMLInputElement>;

    useEffect(() => {
      // eslint-disable-next-line
      !element.current?.classList.contains("flash") &&
        element.current?.classList.add("flash");
      const id = setTimeout(
        () =>
          element.current?.classList.contains("flash") &&
          element.current?.classList.remove("flash"),
        250
      );
      return () => clearTimeout(id);
    }, [price, size]);

    let formattedSize = roundToDecimal(size / Math.pow(10, 6), 3);

    let formattedPrice = roundToDecimal(price / Math.pow(2, 32), 3);

    return (
      <div
        className={classes.row}
        ref={element}
        style={{ marginBottom: 1 }}
        onClick={onSizeClick}
      >
        <div className={classes.white}>{formattedSize}</div>
        <div className={classes.line}>
          <div className={classes.price} onClick={onPriceClick}>
            {formattedPrice}
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) =>
    isEqual(prevProps, nextProps, ["price", "size", "sizePercent"])
);

const MarkPriceComponent = React.memo(
  ({ markPrice }: { markPrice: number | null | undefined }) => {
    const classes = useStyles({})();
    const previousMarkPrice = usePrevious(markPrice);

    let markPriceColor =
      previousMarkPrice && markPrice && markPrice >= previousMarkPrice
        ? "#41C77A"
        : previousMarkPrice && markPrice && markPrice < previousMarkPrice
        ? "#F23B69"
        : "white";

    const formattedMarkPrice = roundToDecimal(markPrice, 3);

    return (
      <div
        className={classes.markPriceContainer}
        style={{
          color: markPriceColor,
        }}
      >
        {previousMarkPrice && markPrice && markPrice >= previousMarkPrice && (
          <ArrowUpwardIcon className={classes.arrow} />
        )}
        {previousMarkPrice && markPrice && markPrice < previousMarkPrice && (
          <ArrowDownwardIcon className={classes.arrow} />
        )}
        <span className={classes.formattedMarkPrice}>
          {formattedMarkPrice || "----"}
        </span>
      </div>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps, ["markPrice"])
);
