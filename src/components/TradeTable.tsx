import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { PastTrade } from "../utils/types";
import { useWallet } from "../utils/wallet";
import { Grid } from "@material-ui/core";
import WalletConnect from "./WalletConnect";
import { useMarket, useUserTrades, MARKETS, findSide } from "../utils/market";
import LaunchIcon from "@material-ui/icons/Launch";
import { ExplorerLink } from "./Link";
import TableContainer from "@material-ui/core/TableContainer";
import { roundToDecimal } from "../utils/utils";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  tableCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "white",
  },
  sellCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "#FF3B69",
  },
  buyCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "#02C77A",
  },
  container: {
    maxHeight: 250,
    width: "100%",
  },
});

const TradeTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCell}>Market</TableCell>
        <TableCell className={classes.tableCell}>Side</TableCell>
        <TableCell className={classes.tableCell}>Size</TableCell>
        <TableCell className={classes.tableCell}>Price</TableCell>
        <TableCell className={classes.tableCell}>Time</TableCell>
        <TableCell className={classes.tableCell} />
      </TableRow>
    </TableHead>
  );
};

const TradeRow = (props: PastTrade) => {
  const classes = useStyles();
  const { market, side, orderSize, time, markPrice, signature, type } = props;
  const date = new Date(time * 1000);
  const marketName = MARKETS.find((m) => m.address === market)?.name;
  return (
    <TableRow>
      <TableCell className={classes.tableCell}>
        {marketName ? marketName : "Unknown"}
      </TableCell>
      <TableCell
        className={
          findSide(type, side) === "buy" ? classes.buyCell : classes.sellCell
        }
      >
        {findSide(type, side)}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {roundToDecimal(orderSize, 10)}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {roundToDecimal(markPrice, 3)}
      </TableCell>
      <TableCell
        className={classes.tableCell}
      >{`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}</TableCell>
      <TableCell>
        <ExplorerLink tx={signature}>
          <LaunchIcon style={{ color: "white", fontSize: 14 }} />
        </ExplorerLink>
      </TableCell>
    </TableRow>
  );
};

const TradeTable = () => {
  const classes = useStyles();
  const { connected } = useWallet();
  const { marketAddress } = useMarket();
  const [pastTrades] = useUserTrades(marketAddress);

  if (!connected) {
    return (
      <Grid container justify="center">
        <WalletConnect />
      </Grid>
    );
  }

  if (!pastTrades) {
    return null;
  }

  return (
    <TableContainer className={classes.container}>
      <Table>
        <TradeTableHead />
        <TableBody>
          {pastTrades?.map((row, i) => {
            return <TradeRow {...row} key={`trade-table-${i}`} />;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TradeTable;
