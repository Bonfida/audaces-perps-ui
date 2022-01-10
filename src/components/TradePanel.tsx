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
import { Typography, Grid } from "@material-ui/core";
import { useMarket, useMarketTrades } from "../utils/market";
import { roundToDecimal } from "../utils/utils";
import LaunchIcon from "../assets/Link/explorer.svg";
import { ExplorerLink } from "./Link";

const useStyles = makeStyles({
  tableCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "white",
    fontWeight: 400,
  },
  tableCellHead: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "white",
    fontWeight: 800,
  },
  sellCell: {
    textTransform: "capitalize",
    fontSize: 12,
    color: "#EB5252",
  },
  buyCell: {
    textTransform: "capitalize",
    fontSize: 12,
    color: "#4EDC76",
  },
  title: {
    fontSize: 16,
    color: "white",
    margin: "unset",
    fontWeight: 700,
    marginLeft: 15,
    textAlign: "center",
  },
  container: {
    maxHeight: 350,
    width: "100%",
  },
  timeCellContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  time: {
    marginRight: 5,
  },
});

const TradeTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell align="left" className={classes.tableCellHead}>
          Size
        </TableCell>
        <TableCell align="center" className={classes.tableCellHead}>
          Price
        </TableCell>
        <TableCell align="right" className={classes.tableCellHead}>
          Time
        </TableCell>
        <TableCell align="right" className={classes.tableCellHead} />
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
      <TableCell
        align="left"
        className={buySide ? classes.buyCell : classes.sellCell}
      >
        {roundToDecimal(orderSize, 10)}
      </TableCell>
      <TableCell align="center" className={classes.tableCell}>
        {roundToDecimal(markPrice, 3)}
      </TableCell>
      <TableCell align="right" className={classes.tableCell}>
        {`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}
      </TableCell>
      <TableCell>
        <ExplorerLink tx={signature}>
          <img src={LaunchIcon} alt="" />
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
        <Typography className={classes.title} align="left" variant="body1">
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
