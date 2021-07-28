import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import { FundingPayment } from "../utils/types";
import LaunchIcon from "@material-ui/icons/Launch";
import { ExplorerLink } from "./Link";
import { useUserFunding, MARKETS, useMarket } from "../utils/market";
import { useWallet } from "../utils/wallet";
import WalletConnect from "./WalletConnect";

const useStyles = makeStyles({
  tableCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "white",
  },
  container: {
    maxHeight: 250,
    width: "100%",
  },
  table: {
    minWidth: 650,
  },
});

const FundingTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCell}>Market</TableCell>
        <TableCell className={classes.tableCell}>Size</TableCell>
        <TableCell className={classes.tableCell}>Time</TableCell>
        <TableCell className={classes.tableCell} />
      </TableRow>
    </TableHead>
  );
};

const FundingTableRow = (props: FundingPayment) => {
  const classes = useStyles();
  const date = new Date(props.time);
  const marketName = MARKETS.find((m) => m.address === props.market)?.name;
  const { marketState } = useMarket();
  return (
    <TableRow>
      <TableCell className={classes.tableCell}>
        {marketName ? marketName : "Unknown"}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {!!marketState?.quoteDecimals && (
          <>{props.amount / marketState?.quoteDecimals}</>
        )}
      </TableCell>
      <TableCell
        className={classes.tableCell}
      >{`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}</TableCell>
      <TableCell>
        <ExplorerLink tx={props.signature}>
          <LaunchIcon style={{ color: "white", fontSize: 14 }} />
        </ExplorerLink>
      </TableCell>
    </TableRow>
  );
};

const FundingPaymentTable = () => {
  const classes = useStyles();
  const { connected } = useWallet();
  const [fundingPayments] = useUserFunding();

  if (!connected) {
    return (
      <Grid container justify="center">
        <WalletConnect />
      </Grid>
    );
  }

  if (!fundingPayments) {
    return null;
  }

  return (
    <TableContainer className={classes.container}>
      <Table>
        <FundingTableHead />
        <TableBody>
          {fundingPayments?.map((row, i) => {
            return <FundingTableRow {...row} key={`funding-table-${i}`} />;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FundingPaymentTable;
