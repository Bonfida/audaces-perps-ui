import React from "react";
import FloatinCard from "./FloatingCard";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { PastTrade } from "../utils/types";
import { Typography } from "@material-ui/core";
import { useMarket, useMarketTrades } from "../utils/market";
import { roundToDecimal } from "../utils/utils";
import LaunchIcon from "@material-ui/icons/Launch";
import { ExplorerLink } from "./Link";

const useStyles = makeStyles({
  tableCell: {
    textTransform: "capitalize",
    fontSize: 12,
    color: "white",
  },
  sellCell: {
    textTransform: "capitalize",
    fontSize: 12,
    color: "#FF3B69",
  },
  buyCell: {
    textTransform: "capitalize",
    fontSize: 12,
    color: "#02C77A",
  },
  title: {
    fontSize: 14,
    color: "white",
    margin: "unset",
    fontWeight: 600,
  },
  container: {
    maxHeight: 350,
    width: "100%",
  },
});

const TradeTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCell}>Size</TableCell>
        <TableCell className={classes.tableCell}>Price</TableCell>
        <TableCell className={classes.tableCell}>Time</TableCell>
        <TableCell className={classes.tableCell} />
      </TableRow>
    </TableHead>
  );
};

const TradeTableRow = (props: PastTrade) => {
  const classes = useStyles();
  const { side, orderSize, time, markPrice, signature } = props;
  const buySide = side === "buy";
  const date = new Date(time * 1000);
  return (
    <TableRow>
      <TableCell className={buySide ? classes.buyCell : classes.sellCell}>
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

const TradePanel = () => {
  const classes = useStyles();
  const { marketAddress } = useMarket();
  const [trades] = useMarketTrades(marketAddress);

  return (
    <FloatinCard>
      <TableContainer className={classes.container}>
        <Typography className={classes.title} align="center" variant="body1">
          Market Trades
        </Typography>
        <Table>
          <TradeTableHead />
          <TableBody style={{ maxHeight: 100, overflow: "scroll" }}>
            {trades?.map((row, i) => {
              return <TradeTableRow {...row} key={`market-trade-${i}`} />;
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </FloatinCard>
  );
};

export default TradePanel;
