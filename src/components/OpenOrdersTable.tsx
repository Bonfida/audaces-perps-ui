import React from "react";
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
import { useOpenOrders } from "../hooks/useOpenOrders";
import Spin from "../components/Spin";
import clsx from "clsx";
import DeleteIcon from "@material-ui/icons/Delete";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Side,
  cancelOrder,
  ECOSYSTEM,
  MarketState,
  AUDACES_ID,
} from "@audaces/perps";
import { PublicKey } from "@solana/web3.js";
import { sendTx } from "../utils/send";
import { refreshAllCaches } from "../utils/fetch-loop";
import { roundToDecimal } from "../utils/utils";

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
});

const OpenOrdersTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCellTitle}>Side</TableCell>
        <TableCell className={classes.tableCellTitle}>Size</TableCell>
        <TableCell className={classes.tableCellTitle}>Price</TableCell>
        <TableCell /> {/* Cancel column */}
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

  const handleDelete = async () => {
    if (!connected || !publicKey) return;
    try {
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
        {side === Side.Bid ? "Buy" : "Ask"}
      </CssTableCell>
      <CssTableCell className={classes.tableCell}>{size}</CssTableCell>
      <CssTableCell className={classes.tableCell}>
        {roundToDecimal(price, 4)}
      </CssTableCell>
      <CssTableCell className={classes.deleteCell}>
        <Button onClick={handleDelete}>
          <DeleteIcon className={classes.deleteIcon} />
        </Button>
      </CssTableCell>
    </TableRow>
  );
};

const OpenOrdersTable = () => {
  const classes = useStyles();
  const [openOrders, openOrdersLoaded] = useOpenOrders();

  if (!openOrdersLoaded) {
    return (
      <div className={classes.spinContainer}>
        <Spin size={50} />
      </div>
    );
  }
  return (
    <TableContainer className={classes.container}>
      <Table>
        <OpenOrdersTableHead />
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
