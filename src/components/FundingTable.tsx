import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import ExplorerIcon from "../assets/Link/explorer.svg";
import { ExplorerLink } from "./Link";
import { MARKETS, useMarket } from "../utils/market";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletConnect from "./WalletConnect";
import Spin from "./Spin";

const useStyles = makeStyles({
  tableCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "white",
    fontWeight: 800,
  },
  container: {
    maxHeight: 250,
    width: "100%",
  },
  table: {
    minWidth: 650,
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

const FundingTableRow = ({
  time,
  market,
  amount,
  signature,
  index,
}: {
  time: number;
  market: string;
  amount: number;
  signature: string;
  index: number;
}) => {
  const classes = useStyles();
  const date = new Date(time);
  const marketName = MARKETS.find((m) => m.address === market)?.name;
  const { marketState } = useMarket();
  return (
    <TableRow style={{ background: index % 2 === 0 ? "#141722" : undefined }}>
      <TableCell className={classes.tableCell}>
        {marketName ? marketName : "Unknown"}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {!!marketState?.quoteDecimals && (
          <>{amount / marketState?.quoteDecimals}</>
        )}
      </TableCell>
      <TableCell
        className={classes.tableCell}
      >{`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}</TableCell>
      <TableCell>
        <ExplorerLink tx={signature}>
          <img src={ExplorerIcon} alt="" />
        </ExplorerLink>
      </TableCell>
    </TableRow>
  );
};

const FundingPaymentTable = () => {
  const classes = useStyles();
  const { connected } = useWallet();
  // const [fundingPayments, fundingPaymentsLoaded] = useUserFunding();

  // if (!connected || !fundingPaymentsLoaded) {
  //   return (
  //     <div className={classes.spinContainer}>
  //       {connected ? <Spin size={50} /> : <WalletConnect />}
  //     </div>
  //   );
  // }

  // if (!fundingPayments) {
  //   return null;
  // }

  return (
    <TableContainer className={classes.container}>
      <Table>
        <FundingTableHead />
        <TableBody>
          {/* {fundingPayments?.map((row, i) => {
            return (
              <FundingTableRow {...row} index={i} key={`funding-table-${i}`} />
            );
          })} */}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FundingPaymentTable;
