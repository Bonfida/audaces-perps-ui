import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import FloatinCard from "../components/FloatingCard";
import { useLeaderBoard } from "../utils/market";
import { getLeaderBoardName, roundToDecimal } from "../utils/utils";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from "@material-ui/core";
import LaunchIcon from "../assets/Link/explorer.svg";
import { ExplorerLink } from "../components/Link";
import { useWallet } from "../utils/wallet";
import Spin from "../components/Spin";
import { useVolume } from "../utils/market";
import ContentLoader from "react-content-loader";
import { useUserDomains } from "../utils/name-service";
import { PublicKey } from "@solana/web3.js";

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
});

const LeaderBoardTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCell}>Rank</TableCell>
        <TableCell className={classes.tableCell}>Name</TableCell>
        <TableCell className={classes.tableCell}>Volume</TableCell>
        <TableCell className={classes.tableCell} />
      </TableRow>
    </TableHead>
  );
};

const LeaderBoardTableRow = ({
  address,
  rank,
  isUser,
  index,
  volume,
}: {
  address: string;
  rank: number;
  isUser: boolean;
  index: number;
  volume: number;
}) => {
  const classes = useStyles();
  const [domains] = useUserDomains(new PublicKey(address));
  console.log(volume);
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

const Loader = () => (
  <ContentLoader
    speed={2}
    width={250}
    height={75}
    viewBox="0 0 250 75"
    backgroundColor="rgba(255, 255, 255, 0.05)"
    foregroundColor="rgba(236, 235, 235, 0.5)"
    style={{ borderRadius: 5 }}
  >
    <rect x="0" y="0" width="250" height="75" />
  </ContentLoader>
);

const Volume = ({
  title,
  value,
  loaded,
}: {
  title: string;
  value: number | undefined | null | string;
  loaded: boolean;
}) => {
  const classes = useStyles();
  return (
    <Grid container justify="flex-end" direction="column" alignItems="flex-end">
      <Grid item>
        {loaded ? (
          <Typography className={classes.volumeValue}>${value}</Typography>
        ) : (
          <Loader />
        )}
      </Grid>
      <Grid item>
        <Typography className={classes.volumeTitle}>{title}</Typography>
      </Grid>
    </Grid>
  );
};

const LeaderboardPage = () => {
  const classes = useStyles();
  const [leaderboard24h, leaderboard24hLoaded] = useLeaderBoard(
    undefined,
    undefined,
    10
  );

  let monthlyEndtime = new Date().getTime() / 1_000;
  monthlyEndtime = monthlyEndtime - (monthlyEndtime % (60 * 60));
  const monthlyStartTime = monthlyEndtime - 30 * 24 * 60 * 60;
  const [leaderboard30d, leaderboard30dLoaded] = useLeaderBoard(
    monthlyStartTime,
    monthlyEndtime,
    50
  );

  const { connected, wallet } = useWallet();
  const _now = Math.floor(new Date().getTime() / 1_000);
  const now = React.useMemo(() => _now - (_now % (60 * 60)), [_now]);
  const [volume24h, volume24hLoaded] = useVolume("all");
  const [volume7d, volume7dLoaded] = useVolume(
    "all",
    now - 7 * 24 * 60 * 60,
    now
  );
  const [volume30d, volume30dLoaded] = useVolume(
    "all",
    now - 30 * 24 * 60 * 60,
    now
  );

  return (
    <>
      <Grid container justify="center" spacing={5}>
        <Grid item>
          <Volume
            title="24h Volume"
            value={volume24h}
            loaded={volume24hLoaded}
          />
        </Grid>
        <Grid item>
          <Volume title="7D Volume" value={volume7d} loaded={volume7dLoaded} />
        </Grid>
        <Grid item>
          <Volume
            title="30D Volume"
            value={volume30d}
            loaded={volume30dLoaded}
          />
        </Grid>
      </Grid>
      {connected && (
        <Typography
          className={classes.text}
          align="center"
          variant="body1"
          style={{ marginTop: 10, marginBottom: 10 }}
        >
          My leaderboard name: {getLeaderBoardName(wallet.publicKey.toBase58())}
        </Typography>
      )}
      <div className={classes.div}>
        <FloatinCard>
          <TableContainer className={classes.container}>
            <Typography
              className={classes.title}
              align="center"
              variant="body1"
            >
              Top Traders by 24h Volume
            </Typography>

            {leaderboard24h && (
              <>
                <Table>
                  <LeaderBoardTableHead />
                  <TableBody style={{ maxHeight: 500, overflow: "scroll" }}>
                    {leaderboard24h?.map((row, i) => {
                      return (
                        <LeaderBoardTableRow
                          index={i}
                          rank={i + 1}
                          address={row.feePayer}
                          key={`leaderboard-24h-${i}`}
                          isUser={
                            connected
                              ? wallet.publicKey.toBase58() === row.feePayer
                              : false
                          }
                          volume={row.volume}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </>
            )}
            {!leaderboard24hLoaded && (
              <div className={classes.loading}>
                <Spin size={50} />
              </div>
            )}
          </TableContainer>
        </FloatinCard>
      </div>
      <div className={classes.div}>
        <FloatinCard>
          <TableContainer className={classes.container}>
            <Typography
              className={classes.title}
              align="center"
              variant="body1"
            >
              Top Traders by 30D Volume
            </Typography>
            {leaderboard30d && (
              <>
                <Table>
                  <LeaderBoardTableHead />
                  <TableBody style={{ maxHeight: 500, overflow: "scroll" }}>
                    {leaderboard30d?.map((row, i) => {
                      return (
                        <LeaderBoardTableRow
                          rank={i + 1}
                          index={i}
                          address={row.feePayer}
                          key={`leaderboard-30d-${i}`}
                          isUser={
                            connected
                              ? wallet.publicKey.toBase58() === row.feePayer
                              : false
                          }
                          volume={row.volume}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </>
            )}
            {!leaderboard30dLoaded && (
              <div className={classes.loading}>
                <Spin size={50} />
              </div>
            )}
          </TableContainer>
        </FloatinCard>
      </div>
    </>
  );
};

export default LeaderboardPage;
