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
import { withStyles } from "@material-ui/core";
// import { useMarket, useMarketTrades } from "../utils/market";
import { useMarket } from "../contexts/market";
import { roundToDecimal } from "../utils/utils";
import LaunchIcon from "../assets/Link/explorer.svg";
import { ExplorerLink } from "./Link";

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
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
    fontSize: 14,
    color: "rgba(255, 255, 255, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    marginBottom: 20,
  },
  container: {
    height: "100%",
    width: "100%",
    overflow: "scroll",
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

const CssTableCell = withStyles({
  root: {
    padding: "5px 0px 2px 0px",
    textAlign: "left",
    borderBottom: "0.5px solid rgba(255, 255, 255, 0.1)",
  },
})(TableCell);

const TradeTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <CssTableCell align="left" className={classes.tableCellHead}>
          Size
        </CssTableCell>
        <CssTableCell align="center" className={classes.tableCellHead}>
          Price
        </CssTableCell>
        <CssTableCell align="right" className={classes.tableCellHead}>
          Time
        </CssTableCell>
        <CssTableCell align="right" className={classes.tableCellHead} />
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
      <CssTableCell
        align="left"
        className={buySide ? classes.buyCell : classes.sellCell}
      >
        {roundToDecimal(orderSize, 10)}
      </CssTableCell>
      <CssTableCell align="center" className={classes.tableCell}>
        {roundToDecimal(markPrice, 3)}
      </CssTableCell>
      <CssTableCell align="right" className={classes.tableCell}>
        {`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}
      </CssTableCell>
      <CssTableCell>
        <ExplorerLink tx={signature}>
          <img src={LaunchIcon} alt="" />
        </ExplorerLink>
      </CssTableCell>
    </TableRow>
  );
};

const TradePanel = () => {
  const classes = useStyles();
  const { currentMarket } = useMarket();
  // const [trades] = useMarketTrades(marketAddress);
  const trades = [];

  return (
    <FloatinCard>
      <div className={classes.root}>
        <span className={classes.title}>Market Trades</span>
        <TableContainer className={classes.container}>
          <Table>
            <TradeTableHead />
            <TableBody>
              {trades?.map((row, i) => {
                return <TradeTableRow {...row} key={`market-trade-${i}`} />;
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </FloatinCard>
  );
};

export default TradePanel;
