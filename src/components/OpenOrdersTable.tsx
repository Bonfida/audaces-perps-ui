import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  Table,
  TableBody,
  Button,
} from "@material-ui/core";
import { Side } from "@audaces/perps";
import { useOpenOrders } from "../hooks/useOpenOrders";
import Spin from "../components/Spin";
import clsx from "clsx";
import DeleteIcon from "@material-ui/icons/Delete";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

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
        <TableCell align="left" className={classes.tableCellTitle}>
          Side
        </TableCell>
        <TableCell align="center" className={classes.tableCellTitle}>
          Size
        </TableCell>
        <TableCell align="center" className={classes.tableCellTitle}>
          Price
        </TableCell>
        <TableCell /> {/* Cancel column */}
      </TableRow>
    </TableHead>
  );
};

const OpenOrderTableRow = ({
  side,
  size,
  price,
}: {
  side: Side;
  size: number;
  price: number;
}) => {
  const classes = useStyles();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const handleDelete = async () => {};

  return (
    <TableRow>
      <TableCell
        align="left"
        className={clsx(
          classes.tableCell,
          side === Side.Bid ? classes.buyColor : classes.sellColor
        )}
      >
        {side === Side.Bid ? "Buy" : "Ask"}
      </TableCell>
      <TableCell align="center" className={classes.tableCell}>
        {size}
      </TableCell>
      <TableCell align="center" className={classes.tableCell}>
        {price}
      </TableCell>
      <TableCell align="right" className={classes.deleteCell}>
        <Button onClick={handleDelete}>
          <DeleteIcon className={classes.deleteIcon} />
        </Button>
      </TableCell>
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
          <OpenOrderTableRow side={Side.Bid} size={1} price={10} />
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OpenOrdersTable;
