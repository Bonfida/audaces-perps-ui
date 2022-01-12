import React from "react";
import { FeesRowProps } from "../utils/types";
import { useFidaAmount } from "../utils/market";
import { useWallet } from "@solana/wallet-adapter-react";
import CheckIcon from "@material-ui/icons/Check";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  makeStyles,
  withStyles,
} from "@material-ui/core";

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
  container: {
    width: "100%",
    maxHeight: 250,
  },
});

const FEES: FeesRowProps[] = [
  {
    feeTier: 0,
    takerFee: "4bps",
    makerRebate: "0bps",
    requirements: "None",
    min: 0,
    max: 10,
  },
  {
    feeTier: 1,
    takerFee: "3.9bps",
    makerRebate: "0bps",
    requirements: "> 10 FIDA",
    min: 10,
    max: 50,
  },
  {
    feeTier: 2,
    takerFee: "3.8bps",
    makerRebate: "0bps",
    requirements: "> 50 FIDA",
    min: 50,
    max: 100,
  },
  {
    feeTier: 3,
    takerFee: "3.7bps",
    makerRebate: "0bps",
    requirements: "> 100 FIDA",
    min: 100,
    max: 1_000,
  },
  {
    feeTier: 4,
    takerFee: "3.6bps",
    makerRebate: "-0.5bps",
    requirements: "> 1,000 FIDA",
    min: 1_000,
    max: 2_000,
  },
  {
    feeTier: 5,
    takerFee: "3.5bps",
    makerRebate: "-1bps",
    requirements: "> 2,000 FIDA",
    min: 2_000,
    max: 3_000,
  },
  {
    feeTier: 6,
    takerFee: "3.5bps",
    makerRebate: "-1.5bps",
    requirements: "> 3,000 FIDA",
    min: 3_000,
    max: 10_000,
  },
  {
    feeTier: 7,
    takerFee: "3bps",
    makerRebate: "2bps",
    requirements: "> 10,000 FIDA",
    min: 10_000,
    max: Infinity,
  },
];

const FeesTableHead = () => {
  const classes = useStyles();
  const { connected } = useWallet();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCellTitle}>Fee Tier</TableCell>
        <TableCell className={classes.tableCellTitle}>Taker Fee</TableCell>
        <TableCell className={classes.tableCellTitle}>Maker rebate</TableCell>
        <TableCell className={classes.tableCellTitle}>Requirements</TableCell>
        {connected && (
          <TableCell className={classes.tableCellTitle}>
            Your Fee Tier
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
};

const FeeTableRow = ({
  feeTier,
  takerFee,
  makerRebate,
  requirements,
  index,
  isUserFeeTier,
}: {
  feeTier: number;
  takerFee: string;
  makerRebate: string;
  requirements: string;
  index: number;
  isUserFeeTier: boolean;
}) => {
  const classes = useStyles();

  const { connected } = useWallet();
  return (
    <TableRow style={{ background: index % 2 === 0 ? "#141722" : undefined }}>
      <CssTableCell className={classes.tableCell}>{feeTier}</CssTableCell>
      <CssTableCell className={classes.tableCell}>{takerFee}</CssTableCell>
      <CssTableCell className={classes.tableCell}>{makerRebate}</CssTableCell>
      <CssTableCell className={classes.tableCell}>{requirements}</CssTableCell>
      {connected && (
        <CssTableCell className={classes.tableCell}>
          {isUserFeeTier && <CheckIcon />}
        </CssTableCell>
      )}
    </TableRow>
  );
};

const FeeTable = () => {
  const classes = useStyles();
  const [fidaAmount] = useFidaAmount();
  return (
    <TableContainer className={classes.container}>
      <Table>
        <FeesTableHead />
        <TableBody>
          {FEES.map((row, i) => {
            return (
              <FeeTableRow
                {...row}
                index={i}
                isUserFeeTier={row.min < fidaAmount && fidaAmount < row.max}
                key={`fee-tier-${i}`}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FeeTable;
