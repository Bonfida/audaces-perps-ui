import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { getLeaderBoardName } from "../utils/utils";
import LaunchIcon from "../assets/Link/explorer.svg";
import { ExplorerLink } from "../components/Link";
import { useWallet } from "../utils/wallet";
import Spin from "../components/Spin";
import { useUserDomains } from "../utils/name-service";
import { PublicKey } from "@solana/web3.js";
import { Trader } from "../utils/types";
import { roundToDecimal } from "../utils/utils";

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
  loading: {
    display: "flex",
    justifyContent: "center",
    marginTop: 50,
  },
  volumeValue: {
    fontSize: 50,
    fontWeight: 600,
    color: "white",
  },
  volumeTitle: {
    fontSize: 24,
    color: "white",
    opacity: 0.8,
  },
  tableCellHead: {
    color: "#77E3EF",
    fontWeight: 700,
    fontSize: 18,
  },
});

const LeaderBoardTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCellHead}>Rank</TableCell>
        <TableCell className={classes.tableCellHead}>Name</TableCell>
        <TableCell className={classes.tableCellHead}>Volume</TableCell>
        <TableCell className={classes.tableCellHead} />
      </TableRow>
    </TableHead>
  );
};

const LeaderBoardTableRow = ({
  address,
  rank,
  isUser,
  volume,
  index,
}: {
  address: string;
  rank: number;
  isUser: boolean;
  volume: number;
  index: number;
}) => {
  const classes = useStyles();
  const [domains] = useUserDomains(new PublicKey(address));
  return (
    <TableRow
      style={{
        background:
          index % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.03)",
      }}
    >
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
        {domains && domains.length > 0
          ? domains[0]
          : getLeaderBoardName(address)}
      </TableCell>
      <TableCell className={classes.tableCell}>
        ${roundToDecimal(volume, 2)?.toLocaleString()}
      </TableCell>
      <TableCell>
        <ExplorerLink address={address}>
          <img src={LaunchIcon} alt="" />
        </ExplorerLink>
      </TableCell>
    </TableRow>
  );
};

const LeaderboardTable = ({
  leaderboard,
  leaderboardLoaded,
}: {
  leaderboard: Trader[] | undefined | null;
  leaderboardLoaded: boolean;
}) => {
  const { connected, wallet } = useWallet();
  const classes = useStyles();
  return (
    <TableContainer className={classes.container}>
      {leaderboard && (
        <>
          <Table>
            <LeaderBoardTableHead />
            <TableBody style={{ maxHeight: 500, overflow: "scroll" }}>
              {leaderboard?.map((row, i) => {
                return (
                  <LeaderBoardTableRow
                    volume={row.volume}
                    index={i}
                    rank={i + 1}
                    address={row.feePayer}
                    key={`leaderboard-24h-${i}`}
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
        </>
      )}
      {!leaderboardLoaded && (
        <div className={classes.loading}>
          <Spin size={50} />
        </div>
      )}
    </TableContainer>
  );
};

export default LeaderboardTable;
