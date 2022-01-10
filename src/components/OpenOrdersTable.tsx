import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TableHead, TableRow, TableCell } from "@material-ui/core";
import { Side } from "@audaces/perps";

const useStyles = makeStyles({
  tableCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "white",
    fontWeight: 800,
  },
});

const OpenOrdersTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCell}>Side</TableCell>
        <TableCell className={classes.tableCell}>Size</TableCell>
        <TableCell className={classes.tableCell}>Price</TableCell>
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
  return (
    <TableRow>
      <TableCell>{side === Side.Bid ? "Buy" : "Ask"}</TableCell>
      <TableCell>{size}</TableCell>
      <TableCell>{price}</TableCell>
    </TableRow>
  );
};

const OpenOrdersTable = () => {
  return null;
};

export default OpenOrdersTable;
