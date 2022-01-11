import React, { useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import WalletConnect from "./WalletConnect";
import Spin from "./Spin";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@material-ui/core";
import CreateIcon from "@material-ui/icons/Create";
import { useSmallScreen } from "../utils/utils";
import MouseOverPopOver from "./MouseOverPopOver";
import { useHistory } from "react-router";
import { usePositions } from "../hooks/usePositions";
import { useEcosystem } from "../hooks/useEcosystem";

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
});

const PenButton = ({ onClick }: { onClick: () => void }) => {
  const classes = useStyles();
  const smallScreen = useSmallScreen("lg");
  if (smallScreen) {
    return null;
  }
  return (
    <IconButton disableRipple onClick={onClick} className={classes.iconButton}>
      <CreateIcon className={classes.createIcon} />
    </IconButton>
  );
};

const PositionTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCell}>Market</TableCell>
        <TableCell className={classes.tableCell}>Entry Price</TableCell>
        <TableCell className={classes.tableCell}>Side</TableCell>
        <TableCell className={classes.tableCell}>Size</TableCell>
        <TableCell className={classes.tableCell}>PnL</TableCell>

        <TableCell className={classes.tableCell}>
          <MouseOverPopOver
            popOverText={<>Liquidation is based on the index price</>}
            textClassName={classes.popOverText}
          >
            <span className={classes.tableCell}>Liq. Price</span>
          </MouseOverPopOver>
        </TableCell>

        <TableCell className={classes.tableCell}>Collateral</TableCell>
        <TableCell />
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

const PositionRow = () => {
  const classes = useStyles();
  const history = useHistory();

  // Compute PnL here

  return <TableRow></TableRow>;
};

const PositionTable = () => {
  const classes = useStyles();
  const [positions, positionsLoaded] = usePositions();
  const [ecosystem, ecosystemLoaded] = useEcosystem();

  const markPrice = 100; // TODO Change

  return (
    <TableContainer style={{ maxHeight: 250 }}>
      <Table>
        <PositionTableHead />
        <TableBody>{null}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default PositionTable;
