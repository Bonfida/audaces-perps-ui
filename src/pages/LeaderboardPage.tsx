import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import FloatinCard from "../components/FloatingCard";
import { useLeaderBoard } from "../utils/market";
import { getLeaderBoardName } from "../utils/utils";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import { ExplorerLink } from "../components/Link";
import { useWallet } from "../utils/wallet";

const useStyles = makeStyles({
  tableCell: {
    textTransform: "capitalize",
    fontSize: 16,
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
    fontSize: 20,
    color: "white",
    margin: "unset",
    fontWeight: 600,
  },
  container: {
    maxHeight: 500,
    width: "100%",
  },
  div: {
    margin: "2%",
  },
  text: {
    fontSize: 16,
    color: "white",
    opacity: 0.8,
    marginTop: 5,
  },
});

const LeaderBoardTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCell}>Rank</TableCell>
        <TableCell className={classes.tableCell}>Name</TableCell>
        <TableCell className={classes.tableCell} />
      </TableRow>
    </TableHead>
  );
};

const LeaderBoardTableRow = ({
  address,
  rank,
  isUser,
}: {
  address: string;
  rank: number;
  isUser: boolean;
}) => {
  const classes = useStyles();
  return (
    <TableRow>
      <TableCell
        className={classes.tableCell}
        style={{ fontWeight: isUser ? 600 : undefined }}
      >
        {rank}
      </TableCell>
      <TableCell
        className={classes.tableCell}
        style={{
          fontWeight: isUser ? 600 : undefined,
          textDecoration: isUser ? "underline" : undefined,
        }}
      >
        {getLeaderBoardName(address)}
      </TableCell>
      <TableCell>
        <ExplorerLink address={address}>
          <LaunchIcon style={{ color: "white", fontSize: 14 }} />
        </ExplorerLink>
      </TableCell>
    </TableRow>
  );
};

const LeaderboardPage = () => {
  const classes = useStyles();
  const [leaderboard] = useLeaderBoard();
  const { connected, wallet } = useWallet();
  return (
    <div className={classes.div}>
      <FloatinCard>
        <TableContainer className={classes.container}>
          <Typography className={classes.title} align="center" variant="body1">
            Top Traders by 24h Volume
          </Typography>
          {connected && (
            <Typography className={classes.text} align="center" variant="body1">
              My leaderboard name:{" "}
              {getLeaderBoardName(wallet.publicKey.toBase58())}
            </Typography>
          )}
          <Table>
            <LeaderBoardTableHead />
            <TableBody style={{ maxHeight: 500, overflow: "scroll" }}>
              {leaderboard?.map((row, i) => {
                return (
                  <LeaderBoardTableRow
                    rank={i + 1}
                    address={row.feePayer}
                    key={`leaderboard-${i}`}
                    isUser={
                      connected
                        ? wallet.publicKey.toBase58() === row.feePayer
                        : false
                    }
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </FloatinCard>
    </div>
  );
};

export default LeaderboardPage;
