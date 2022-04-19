import React, { useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import {
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  Table,
  TableBody,
  Button,
} from "@material-ui/core";
import Spin from "../components/Spin";
import clsx from "clsx";
import DeleteIcon from "@material-ui/icons/Delete";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Side, cancelOrder, MarketState, AUDACES_ID } from "@audaces/perps";
import { PublicKey } from "@solana/web3.js";
import { sendTx } from "../utils/send";
import { refreshAllCaches } from "../utils/fetch-loop";
import { roundToDecimal } from "../utils/utils";
import { IOpenOrder } from "@audaces/perps";
import WalletConnect from "./WalletConnect";
import { notify } from "../utils/notifications";
import { ECOSYSTEM } from "../contexts/market";

const CssTableCell = withStyles({
  root: {
    padding: "5px 0px 2px 20px",
    textAlign: "left",
    borderBottom: "0.5px solid rgba(255, 255, 255, 0.1)",
  },
})(TableCell);

const useStyles = makeStyles({
  tableCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "white",
    fontWeight: 800,
  },
  tableCellTitle: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "rgb(124, 127, 131)",
    fontWeight: 800,
  },
  spinContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    flexDirection: "column",
    marginTop: "5%",
  },
  container: {
    maxHeight: 250,
    width: "100%",
  },
  buyColor: {
    color: "#02C77A",
  },
  sellColor: {
    color: "#FF3B69",
  },
  deleteIcon: {
    color: "white",
  },
  deleteCell: {
    padding: 0,
  },
  cancelAllButton: {
    color: "#FF3B69",
    border: "1px solid  #FF3B69",
    borderRadius: 5,
    margin: 0,
    fontSize: 14,
    fontWeight: "bold",
    height: 30,
    width: 150,
    display: "flex",
    alignItems: "center",
    justifyContent: "centero",
  },
  cancelTableCell: {
    width: 200,
  },
});

const OpenOrdersTableHead = ({
  openOrders,
}: {
  openOrders: IOpenOrder[] | null | undefined;
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const showCancellAll = openOrders?.length && openOrders?.length > 0;

  // TODO only cancel for the market of the page
  const handleCancel = async () => {
    if (!openOrders || !publicKey) return;
    try {
      setLoading(true);
      const marketState = await MarketState.retrieve(
        connection,
        openOrders[0].market
      );
      console.log(1, openOrders[0].market.toBase58());
      const ordered = [...openOrders].sort(
        (a, b) => a.orderIndex - b.orderIndex
      );

      for (let o of ordered) {
        console.log(2, o.market.toBase58());
        const ix = await cancelOrder(
          publicKey,
          o.market,
          marketState,
          ECOSYSTEM,
          o.orderIndex,
          AUDACES_ID
        );
        await sendTx(connection, publicKey, ix.instructions, sendTransaction);
      }
    } catch (err) {
      console.log(err);
      notify({ message: "Error sending cancel transaction" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCellTitle}>Side</TableCell>
        <TableCell className={classes.tableCellTitle}>Size</TableCell>
        <TableCell className={classes.tableCellTitle}>Price</TableCell>
        {/* <TableCell /> */}
        <TableCell
          className={clsx(classes.tableCellTitle, classes.cancelTableCell)}
        >
          {showCancellAll && (
            <Button
              onClick={handleCancel}
              variant="outlined"
              className={classes.cancelAllButton}
            >
              {loading ? <Spin size={15} /> : "Cancel all"}
            </Button>
          )}
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const OpenOrderTableRow = ({
  side,
  size,
  price,
  orderIndex,
  market,
}: {
  side: Side;
  size: number;
  price: number;
  orderIndex: number;
  market: PublicKey;
}) => {
  const classes = useStyles();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!connected || !publicKey) return;
    try {
      setLoading(true);
      const marketState = await MarketState.retrieve(connection, market);
      const ix = await cancelOrder(
        publicKey,
        market,
        marketState,
        ECOSYSTEM,
        orderIndex,
        AUDACES_ID
      );

      await sendTx(connection, publicKey, ix.instructions, sendTransaction);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      refreshAllCaches();
    }
  };

  return (
    <TableRow>
      <CssTableCell
        className={clsx(
          classes.tableCell,
          side === Side.Bid ? classes.buyColor : classes.sellColor
        )}
      >
        {side === Side.Bid ? "Buy" : "Sell"}
      </CssTableCell>
      <CssTableCell className={classes.tableCell}>
        {roundToDecimal(size / Math.pow(10, 6), 3)}
      </CssTableCell>
      <CssTableCell className={classes.tableCell}>
        {roundToDecimal(price, 3)}
      </CssTableCell>
      <CssTableCell className={classes.deleteCell}>
        <Button onClick={handleDelete}>
          {loading ? (
            <Spin size={20} />
          ) : (
            <DeleteIcon className={classes.deleteIcon} />
          )}
        </Button>
      </CssTableCell>
    </TableRow>
  );
};

const OpenOrdersTable = ({
  openOrders,
  openOrdersLoaded,
}: {
  openOrders: IOpenOrder[] | null | undefined;
  openOrdersLoaded: boolean;
}) => {
  const classes = useStyles();
  const { connected } = useWallet();

  if (!openOrdersLoaded) {
    return (
      <div className={classes.spinContainer}>
        {connected ? <Spin size={50} /> : <WalletConnect />}
      </div>
    );
  }
  return (
    <TableContainer className={classes.container}>
      <Table>
        <OpenOrdersTableHead openOrders={openOrders} />
        <TableBody>
          {openOrders?.map((o, idx) => {
            return (
              <OpenOrderTableRow
                key={`order-${idx}`}
                side={o.side}
                size={o.size}
                price={o.price}
                orderIndex={o.orderIndex}
                market={o.market}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OpenOrdersTable;
