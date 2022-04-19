import React from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ExplorerIcon from "../assets/Link/explorer.svg";
import { useWallet } from "@solana/wallet-adapter-react";
import Spin from "./Spin";
import WalletConnect from "./WalletConnect";
import { useMarket, useUserTrades, MARKETS, findSide } from "../utils/market";
import { ExplorerLink } from "./Link";
import TableContainer from "@material-ui/core/TableContainer";
import { roundToDecimal } from "../utils/utils";

const CssTableCell = withStyles({
  root: {
    padding: "5px 0px 2px 20px",
    textAlign: "left",
    borderBottom: "0.5px solid rgba(255, 255, 255, 0.1)",
  },
})(TableCell);

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
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
  sellCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "#EB5252",
    fontWeight: 800,
  },
  buyCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "#4EDC76",
    fontWeight: 800,
  },
  container: {
    maxHeight: 250,
    width: "100%",
  },
  spinContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    flexDirection: "column",
    marginTop: "5%",
  },
});

const TradeTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCellTitle}>Market</TableCell>
        <TableCell className={classes.tableCellTitle}>Side</TableCell>
        <TableCell className={classes.tableCellTitle}>Size</TableCell>
        <TableCell className={classes.tableCellTitle}>Price</TableCell>
        <TableCell className={classes.tableCellTitle}>Time</TableCell>
        <TableCell className={classes.tableCellTitle} />
      </TableRow>
    </TableHead>
  );
};

const TradeRow = ({
  market,
  side,
  orderSize,
  time,
  markPrice,
  signature,
  type,
  index,
}: {
  market: string;
  side: string;
  orderSize: number;
  time: number;
  markPrice: number;
  signature: string;
  type: string;
  index: number;
}) => {
  const classes = useStyles();
  const date = new Date(time * 1000);
  const marketName = MARKETS.find((m) => m.address === market)?.name;
  return (
    <TableRow style={{ background: index % 2 === 0 ? "#141722" : undefined }}>
      <CssTableCell className={classes.tableCell}>
        {marketName ? marketName : "Unknown"}
      </CssTableCell>
      <CssTableCell
        className={
          findSide(type, side) === "buy" ? classes.buyCell : classes.sellCell
        }
      >
        {findSide(type, side)}
      </CssTableCell>
      <CssTableCell className={classes.tableCell}>
        {roundToDecimal(orderSize, 10)}
      </CssTableCell>
      <CssTableCell className={classes.tableCell}>
        {roundToDecimal(markPrice, 3)}
      </CssTableCell>
      <CssTableCell
        className={classes.tableCell}
      >{`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}</CssTableCell>
      <CssTableCell>
        <ExplorerLink tx={signature}>
          <img src={ExplorerIcon} alt="" />
        </ExplorerLink>
      </CssTableCell>
    </TableRow>
  );
};

const TradeTable = () => {
  return null;
  // const classes = useStyles();
  // const { connected } = useWallet();
  // const { marketAddress } = useMarket();
  // const [pastTrades, pastTradesLoaded] = useUserTrades(marketAddress);

  // if (!connected || !pastTradesLoaded) {
  //   return (
  //     <div className={classes.spinContainer}>
  //       {connected ? <Spin size={50} /> : <WalletConnect />}
  //     </div>
  //   );
  // }

  // if (!pastTrades) {
  //   return null;
  // }

  // return (
  //   <TableContainer className={classes.container}>
  //     <Table>
  //       <TradeTableHead />
  //       <TableBody>
  //         {pastTrades?.map((row, i) => {
  //           return <TradeRow {...row} index={i} key={`trade-table-${i}`} />;
  //         })}
  //       </TableBody>
  //     </Table>
  //   </TableContainer>
  // );
};

export default TradeTable;
