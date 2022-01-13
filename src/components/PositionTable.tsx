import React, { useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import WalletConnect from "./WalletConnect";
import Spin from "./Spin";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { PublicKey } from "@solana/web3.js";
import { useHistory } from "react-router";
import { useOpenPositions } from "../hooks/useOpenPositions";
import { useEcosystem } from "../hooks/useEcosystem";
import { Ecosystem, OpenMarket, Side } from "@audaces/perps";
import { roundToDecimal } from "../utils/utils";
import { useMarkPrice } from "../hooks/useMarkPrice";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";

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
    color: "#FF3B69",
  },
  buyCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "#02C77A",
  },
  indicator: {
    backgroundColor: "#5C1864",
  },
  button: {
    color: "#77E3EF",
    background: "transparent",
    width: "auto",
    fontSize: 14,
    fontWeight: 800,
  },
  loading: {
    color: "white",
    fontSize: 18,
  },
  closeButton: {
    minWidth: 80,
    color: "#EB5252",
    fontWeight: 800,
    fontSize: 14,
  },
  createIcon: {
    color: "white",
    marginBottom: 2,
    fontSize: 20,
    marginLeft: 8,
  },
  iconButton: {
    padding: 0,
    margin: 0,
  },
  popOverText: {
    color: "white",
    fontSize: 12,
  },
  marketName: {
    fontWeight: 600,
    fontSize: 14,
  },
  greenColor: {
    color: "#02C77A",
  },
  redColor: {
    color: "#FF3B69",
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
});

const PositionTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCellTitle}>Market</TableCell>
        <TableCell className={classes.tableCellTitle}>Side</TableCell>
        <TableCell className={classes.tableCellTitle}>Size</TableCell>
        <TableCell className={classes.tableCellTitle}>Entry Price</TableCell>
        <TableCell className={classes.tableCellTitle}>Mark price</TableCell>
        <TableCell className={classes.tableCellTitle}>PnL</TableCell>
        <TableCell />
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

// TODO change
const marketNameFromAddress = (address: PublicKey) => {
  return "BTC-PERP";
};

const PositionRow = ({
  ecosystem,
  openMarket,
}: {
  ecosystem: Ecosystem;
  openMarket: OpenMarket;
}) => {
  const classes = useStyles();
  const history = useHistory();
  const marketAddress = ecosystem.markets[openMarket.ecosystemIndex].address;
  const [markPrice] = useMarkPrice(marketAddress);

  const baseDecimals = 6; // TODO use marketState

  const entryPrice = Math.abs(
    openMarket.quoteAmount.toNumber() / openMarket.baseAmount.toNumber()
  );
  const baseSize =
    openMarket.baseAmount.toNumber() / Math.pow(10, baseDecimals);
  const side = baseSize > 0 ? Side.Bid : Side.Ask;

  const pnl = markPrice
    ? side === Side.Bid
      ? markPrice - entryPrice
      : entryPrice - markPrice
    : 0;

  return (
    <TableRow>
      {/* Market */}
      <TableCell className={classes.tableCell}>
        {marketNameFromAddress(marketAddress)}
      </TableCell>
      {/* Side */}
      <TableCell
        className={clsx(
          classes.tableCell,
          side === Side.Bid ? classes.greenColor : classes.redColor
        )}
      >
        {side === Side.Bid ? "Long" : "Short"}
      </TableCell>
      {/* Size */}
      <TableCell className={classes.tableCell}>
        {roundToDecimal(baseSize, 3)}
      </TableCell>
      {/* Entry price */}
      <TableCell className={classes.tableCell}>
        {roundToDecimal(entryPrice, 3) || 0}
      </TableCell>
      {/* Mark price */}
      <TableCell className={classes.tableCell}>
        {roundToDecimal(markPrice, 3)}
      </TableCell>
      {/* PnL */}
      <TableCell
        className={clsx(
          classes.tableCell,
          pnl >= 0 ? classes.greenColor : classes.redColor
        )}
      >
        {roundToDecimal(pnl, 3)}
      </TableCell>
    </TableRow>
  );
};

const PositionTable = () => {
  const classes = useStyles();
  const { connected } = useWallet();
  const [positions, positionsLoaded] = useOpenPositions();
  const [ecosystem, ecosystemLoaded] = useEcosystem();

  const markPrice = 100; // TODO Change

  if (!positions || !ecosystem || !connected) {
    return (
      <div className={classes.spinContainer}>
        {connected ? <Spin size={50} /> : <WalletConnect />}
      </div>
    );
  }

  return (
    <TableContainer className={classes.container}>
      <Table>
        <PositionTableHead />
        <TableBody>
          {positions?.map((position) => {
            return <PositionRow ecosystem={ecosystem} openMarket={position} />;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PositionTable;
