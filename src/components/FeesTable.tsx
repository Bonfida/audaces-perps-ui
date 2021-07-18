import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import { FeesRowProps } from "../utils/types";
import { Grid } from "@material-ui/core";
import MouseOverPopOver from "./MouseOverPopOver";
import InfoIcon from "@material-ui/icons/Info";

const useStyles = makeStyles({
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
  title: {
    fontSize: 18,
    color: "white",
    opacity: 0.8,
  },
  container: {
    width: "100%",
    maxHeight: 250,
  },
  h2: {
    fontSize: "max(4vw, 40px)",
    fontWeight: 400,
    color: "white",
    opacity: 0.8,
    margin: "2%",
  },
  text: {
    color: "white",
  },
  infoIcon: {
    fontSize: 16,
    marginTop: 5,
    opacity: 0.8,
  },
});

const FEES: FeesRowProps[] = [
  {
    feeTier: 0,
    fee: "0.20%",
    feeHighLeverage: "0.50%",
    requirements: "None",
  },
  {
    feeTier: 1,
    fee: "0.15%",
    feeHighLeverage: "0.40%",
    requirements: "> 500 FIDA",
  },
  {
    feeTier: 2,
    fee: "0.15%",
    feeHighLeverage: "0.30%",
    requirements: "> 1,000 FIDA",
  },
  {
    feeTier: 3,
    fee: "0.10%",
    feeHighLeverage: "0.25%",
    requirements: "> 10,000 FIDA",
  },
  {
    feeTier: 4,
    fee: "0.10%",
    feeHighLeverage: "0.20%",
    requirements: "> 100,000 FIDA",
  },
  {
    feeTier: 5,
    fee: "0.10%",
    feeHighLeverage: "0.15%",
    requirements: "> 1,000,000 FIDA",
  },
];

const FeesTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCell}>Fee Tier</TableCell>
        <TableCell className={classes.tableCell}>Fee</TableCell>
        <TableCell className={classes.tableCell}>
          <Grid container spacing={1} alignItems="center">
            <Grid item>Fee High Leverage</Grid>
            <Grid item>
              <MouseOverPopOver
                popOverText="Higher than 8x leverage"
                textClassName={classes.text}
              >
                <InfoIcon className={classes.infoIcon} />
              </MouseOverPopOver>
            </Grid>
          </Grid>
        </TableCell>
        <TableCell className={classes.tableCell}>Requirements</TableCell>
      </TableRow>
    </TableHead>
  );
};

const FeeTableRow = (props: FeesRowProps) => {
  const classes = useStyles();
  const { feeTier, fee, feeHighLeverage, requirements } = props;

  return (
    <TableRow>
      <TableCell className={classes.tableCell}>{feeTier}</TableCell>
      <TableCell className={classes.tableCell}>{fee}</TableCell>
      <TableCell className={classes.tableCell}>{feeHighLeverage}</TableCell>
      <TableCell className={classes.tableCell}>{requirements}</TableCell>
    </TableRow>
  );
};

const FeeTable = () => {
  const classes = useStyles();
  return (
    <>
      <Grid container justify="center">
        <TableContainer className={classes.container}>
          <Table>
            <FeesTableHead />
            <TableBody style={{ maxHeight: 100, overflow: "scroll" }}>
              {FEES.map((row, i) => {
                return <FeeTableRow {...row} key={`fee-tier-${i}`} />;
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  );
};

export default FeeTable;
