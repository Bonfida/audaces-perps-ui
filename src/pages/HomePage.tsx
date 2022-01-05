import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Fade } from "@material-ui/core";
import HelpUrls from "../utils/HelpUrls";
import solana from "../assets/homepage/solana.png";
import ipfs from "../assets/homepage/ipfs.png";
import github from "../assets/homepage/github.png";
import Link from "../components/Link";
import { useParams } from "react-router-dom";
import { notify } from "../utils/notifications";
import back from "../assets/homepage/back.svg";
import { useHistory } from "react-router";
import { useVolume, useLeaderBoard } from "../utils/market";
import LeaderboardTable from "../components/LeaderBoardTable";
import { Trader } from "../utils/types";
import {
  useSmallScreen,
  useWindowSize,
  useLocalStorageState,
} from "../utils/utils";
import "../index.css";
import Emoji from "../components/Emoji";

const useStyles = makeStyles({
  h1: {
    color: "#FFFFFF",
    fontSize: 68,
    margin: 10,
    fontWeight: 800,
    lineHeight: "1.0em",
  },
  h2: {
    color: "#FFFFFF",
    fontSize: 42,
    margin: 10,
    fontWeight: 800,
    lineHeight: "1.0em",
  },
  builtOnSolana: {
    fontSize: 26,
    marginLeft: 15,
    fontWeight: 400,
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
  startTradingButton: {
    background: "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
    borderRadius: 30,
    margin: 1,
    textTransform: "capitalize",
    width: 300,
    color: "#77E3EF",
    fontWeight: 800,
    height: 60,
    fontSize: 24,
    "&:hover": {
      background:
        "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
    },
  },
  startTradingButtonContainer: {
    background: "linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)",
    borderRadius: 30,
    width: 302,
    marginTop: 20,
    marginLeft: 10,
    height: 62,
  },
  imgFeelSection: {
    height: 35,
  },
  titleFeelSection: {
    color: "rgba(119, 227, 239, 1)",
  },
  descriptionFeelSection: {
    color: "#FFFFFF",
    maxWidth: 171,
  },
  illusion: {
    zIndex: -1,
    position: "absolute",
    overflow: "hidden",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 68,
    margin: 10,
    fontWeight: 800,
    lineHeight: "1.0em",
  },
  cardSubtitle: {
    color: "rgb(119, 227, 239)",
    fontSize: 42,
    fontWeight: 600,
  },
  cardDescription: {
    color: "#FFFFFF",
    fontSize: 18,
    maxWidth: 450,
  },
  cardIcon: {
    height: 40,
    marginTop: 15,
    marginLeft: 15,
  },
  buttonContainer: {
    background: "linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)",
    borderRadius: 25,
    width: 200,
  },
  button: {
    background: "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
    margin: 1,
    borderRadius: 20,
    width: 198,
    "&:hover": {
      background:
        "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
    },
  },
  coloredText: {
    textTransform: "capitalize",
    fontWeight: 400,
    backgroundImage: "linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)",
    backgroundClip: "text",
    color: "#60C0CB",
    "-webkit-background-clip": "text",
    "-moz-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
    "-moz-text-fill-color": "transparent",
  },
  nodeColoredText: {
    textTransform: "capitalize",
    fontWeight: 400,
    fontSize: 42,
    backgroundImage: "linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)",
    backgroundClip: "text",
    color: "#60C0CB",
    "-webkit-background-clip": "text",
    "-moz-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
    "-moz-text-fill-color": "transparent",
  },
  backIcon: {
    marginRight: 10,
  },
  imgDecentralizedSection: {
    height: 100,
  },
  link: {
    textDecoration: "none",
  },
  cubeBottom: {
    position: "absolute",
    bottom: -300,
    right: -50,
    zIndex: -2,
    mixBlendMode: "hard-light",
  },
  volumeColoredText: {
    textTransform: "capitalize",
    fontWeight: 800,
    fontSize: 110,
    color: "rgb(119, 227, 239)",
  },
  volumeCaption: {
    marginTop: 0,
    color: "#CDCDC1",
    fontSize: 16,
    fontWeight: 400,
    textTransform: "uppercase",
  },
  secondaryVolume: {
    fontWeight: 600,
    fontSize: 42,
    color: "#FFFFFF",
  },
  wolveCard: {
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    borderRadius: 8,
    height: 120,
    width: 196,
    margin: 1,
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1125) 9.37%, rgba(255, 255, 255, 0.0375) 54.69%, rgba(255, 255, 255, 0.0394911) 66.15%, rgba(255, 255, 255, 0.15) 100%)",
    "&:hover": {
      cursor: "pointer",
      boxShadow:
        "0px 4px 36px -7px rgba(255, 255, 255, 0.03), 0px -1px 81px 17px rgba(255, 255, 255, 0.05)",
    },
  },

  wolveCardContainer: {
    background: "linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)",
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    width: 198,
    height: 103,
    "&:hover": {
      cursor: "pointer",
      background: "linear-gradient(135deg, #37BCBD 0%, #B846B2 100%)",
    },
  },
  wolveCardTextSelected: {
    textTransform: "capitalize",
    fontWeight: 600,
    fontSize: 42,
    color: "rgb(119, 227, 239)",
  },
  wolveCardText: {
    textTransform: "capitalize",
    fontWeight: 600,
    fontSize: 42,
    color: "#FFFFFF",
  },
  wolveCardSubtitle: {
    textTransform: "capitalize",
    fontWeight: 400,
    fontSize: 18,
    color: "#FFFFFF",
  },
});

const Banner = () => {
  const classes = useStyles();
  const history = useHistory();
  const [market] = useLocalStorageState("market");
  return (
    <>
      <Typography className={classes.builtOnSolana}>Built on Solana</Typography>
      <Typography className={classes.h1}>
        On-chain <br />
        Perpetual swaps
      </Typography>
      <div className={classes.startTradingButtonContainer}>
        <Button
          className={classes.startTradingButton}
          onClick={() => history.push(`/trade/${market?.name || "BTC-PERP"}`)}
        >
          Start trading
        </Button>
      </div>
    </>
  );
};

const StakingCard = () => {
  const classes = useStyles();
  const smallScreen = useSmallScreen();
  return (
    <div
      className="fancy-card"
      style={{
        width: smallScreen ? "auto" : undefined,
        height: smallScreen ? "auto" : undefined,
        margin: smallScreen ? 15 : undefined,
      }}
    >
      <Typography className={classes.cardTitle}>Buy and Burn</Typography>
      <div>
        <Typography className={classes.cardSubtitle}>Buy and burn</Typography>
        <Typography className={classes.cardDescription}>
          30% of all fees generated go to FIDA buy and burns.
        </Typography>
      </div>
      <div>
        <Typography className={classes.cardSubtitle}>
          Decentralized <Emoji emoji="🔥" />
        </Typography>
        <Typography className={classes.cardDescription}>
          The buy and burn was made decentralized and permissionless
        </Typography>
      </div>
      <div
        className={classes.buttonContainer}
        style={{ marginTop: "min(10%, 40px)" }}
      >
        <Link external to={HelpUrls.burn} className={classes.link}>
          <Button className={classes.button}>
            <Typography className={classes.coloredText}>
              Start burning
            </Typography>
          </Button>
        </Link>
      </div>
    </div>
  );
};

const NodeCard = () => {
  const classes = useStyles();
  const [front, setFront] = useState(true);
  const smallScreen = useSmallScreen();

  const onClick = () => {
    setFront((prev) => !prev);
  };

  return (
    <div
      className="fancy-card"
      style={{
        width: smallScreen ? "auto" : undefined,
        margin: smallScreen ? 5 : undefined,
        height: smallScreen ? "auto" : undefined,
      }}
    >
      {front && (
        <>
          <Typography className={classes.cardTitle}>Nodes</Typography>
          <div>
            <Typography className={classes.cardSubtitle}>
              Secure the network
            </Typography>
            <Typography className={classes.cardDescription}>
              Nodes secure the network by cranking transactions.
            </Typography>
          </div>
          <div>
            <Typography className={classes.cardSubtitle}>
              Earn a reward
            </Typography>
            <Typography className={classes.cardDescription}>
              Nodes who crank funding rates and liquidations get rewarded for
              each transaction they crank.
            </Typography>
          </div>
          <div
            className={classes.buttonContainer}
            style={{ marginTop: "min(10%, 40px)" }}
          >
            <Button className={classes.button} onClick={onClick}>
              <Typography className={classes.coloredText}>Learn how</Typography>
            </Button>
          </div>
        </>
      )}
      {!front && (
        <Fade in={true} timeout={500}>
          <div>
            <div onClick={onClick} style={{ cursor: "pointer" }}>
              <Typography className={classes.cardDescription}>
                <img src={back} className={classes.backIcon} alt="" />
                Back
              </Typography>
            </div>
            <Typography className={classes.nodeColoredText}>
              What are nodes?
            </Typography>
            <Typography className={classes.cardDescription}>
              Perpetual nodes secure the protocol by cranking liquidations and
              updating funding rates. Anyone can run a node and help secure the
              protocol
            </Typography>
            <Typography className={classes.nodeColoredText}>
              Set up your node
            </Typography>
            <Typography className={classes.cardDescription}>
              Anyone can set up a node and start cranking! Cranking can be done
              using the JavaScript SDK available on NPM or a Rust executable
              available on Github.
            </Typography>
            <Typography className={classes.nodeColoredText}>
              Crank manually
            </Typography>
            <Typography className={classes.cardDescription}>
              You can crank liquidations and funding rates manually and try
              earning a rewards!
            </Typography>
            <div
              style={{
                marginTop: 10,
              }}
            >
              <div className={classes.buttonContainer}>
                <Button
                  className={classes.button}
                  onClick={() => window.open(HelpUrls.github, "_blank")}
                >
                  <Typography className={classes.coloredText}>
                    Github
                  </Typography>
                </Button>
              </div>
            </div>
          </div>
        </Fade>
      )}
    </div>
  );
};

const DecentralizedSection = () => {
  const classes = useStyles();
  return (
    <>
      <Typography align="center" className={classes.h2}>
        Decentralized and opensource
      </Typography>
      <Grid
        container
        justify="center"
        alignItems="center"
        spacing={5}
        style={{ marginTop: 30 }}
      >
        <Grid item>
          <Link external to={HelpUrls.solana}>
            <img
              src={solana}
              className={classes.imgDecentralizedSection}
              alt=""
            />
          </Link>
        </Grid>
        <Grid item>
          <Link external to={HelpUrls.ipfs}>
            <img
              src={ipfs}
              className={classes.imgDecentralizedSection}
              alt=""
            />
          </Link>
        </Grid>
        <Grid item>
          <Link external to={HelpUrls.github}>
            <img
              src={github}
              className={classes.imgDecentralizedSection}
              alt=""
            />
          </Link>
        </Grid>
      </Grid>
    </>
  );
};

const VolumeDetails = () => {
  const classes = useStyles();
  const _now = Math.floor(new Date().getTime() / 1_000);
  const now = React.useMemo(() => _now - (_now % (60 * 60)), [_now]);
  const [volume24h] = useVolume("all");
  const [volume7d] = useVolume("all", now - 7 * 24 * 60 * 60, now);
  const [volume30d] = useVolume("all", now - 30 * 24 * 60 * 60, now);
  const smallScreen = useSmallScreen();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: smallScreen ? "column" : "row",
      }}
    >
      <Typography
        className={classes.h2}
        align="right"
        style={{ marginRight: 100 }}
      >
        Our trading volumes
      </Typography>
      <div>
        <Typography
          className={classes.volumeColoredText}
          style={{
            fontSize: smallScreen ? "4rem" : undefined,
            marginBottom: smallScreen ? 0 : -40,
          }}
          align="right"
        >
          ${volume24h}
        </Typography>
        <Typography className={classes.volumeCaption} align="right">
          24h Volume
        </Typography>
        <Grid
          container
          justify="flex-end"
          alignItems={smallScreen ? "flex-end" : "center"}
          spacing={5}
          direction={smallScreen ? "column" : "row"}
        >
          <Grid item>
            <Typography className={classes.secondaryVolume} align="right">
              ${volume7d}
            </Typography>
            <Typography className={classes.volumeCaption} align="right">
              7D Volume
            </Typography>
          </Grid>
          <Grid item>
            <Typography className={classes.secondaryVolume} align="right">
              ${volume30d}
            </Typography>
            <Typography className={classes.volumeCaption} align="right">
              30D Volume
            </Typography>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

const VolumeSection = () => {
  const { width } = useWindowSize();
  if (width < 650) {
    return <VolumeDetails />;
  }
  if (width < 1420) {
    return (
      <Grid
        container
        justify="center"
        style={{ marginTop: 40, marginBottom: 40 }}
      >
        <Grid item>
          <VolumeDetails />
        </Grid>
      </Grid>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <Grid container justify="space-evenly" alignItems="center">
        <Grid item>
          <VolumeDetails />
        </Grid>
      </Grid>
    </div>
  );
};

const WolveCard = ({
  time,

  selected,
}: {
  time: string;

  selected: boolean;
}) => {
  const classes = useStyles();
  if (!selected) {
    return (
      <div className={classes.wolveCard}>
        <div>
          <Typography className={classes.wolveCardText}>{time}</Typography>
          <Typography className={classes.wolveCardSubtitle}>Leaders</Typography>
        </div>
      </div>
    );
  }
  return (
    <div className="leader-card">
      <div>
        <Typography className={classes.wolveCardTextSelected}>
          {time}
        </Typography>
        <Typography className={classes.wolveCardSubtitle}>Leaders</Typography>
      </div>
    </div>
  );
};

const Leaderboardsection = () => {
  const classes = useStyles();
  const [leaderboard, setLeaderBoard] = useState<null | undefined | Trader[]>(
    null
  );
  const [card, setCard] = useState(0);
  const [leaderboard24h, leaderboard24hLoaded] = useLeaderBoard(
    undefined,
    undefined,
    10
  );

  let monthlyEndtime = new Date().getTime() / 1_000;
  monthlyEndtime = monthlyEndtime - (monthlyEndtime % (60 * 60));
  const monthlyStartTime = monthlyEndtime - 30 * 24 * 60 * 60;
  const [leaderboard30d] = useLeaderBoard(monthlyStartTime, monthlyEndtime, 10);

  useEffect(() => {
    if (!leaderboard && !!leaderboard24h) {
      setLeaderBoard(leaderboard24h);
    }
    // eslint-disable-next-line
  }, [leaderboard24hLoaded, leaderboard24h]);

  return (
    <>
      <Grid container justify="center" alignItems="center" spacing={5}>
        <Grid item>
          <Typography className={classes.h2}>Bonfida wolves</Typography>
          <Typography
            className={classes.wolveCardSubtitle}
            style={{ marginLeft: 10, marginBottom: 20 }}
          >
            Can you make it to the top 10?
          </Typography>

          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div
              style={{ marginRight: 30 }}
              onClick={() => {
                setLeaderBoard(leaderboard24h);
                setCard(0);
              }}
            >
              <WolveCard time="24H" selected={card === 0} />
            </div>

            <div
              onClick={() => {
                setLeaderBoard(leaderboard30d);
                setCard(1);
              }}
            >
              <WolveCard time="30D" selected={card === 1} />
            </div>
          </div>
        </Grid>
        <Grid item>
          <div style={{ maxWidth: 500 }}>
            <LeaderboardTable
              leaderboard={leaderboard}
              leaderboardLoaded={!!leaderboard}
            />
          </div>
        </Grid>
      </Grid>
    </>
  );
};

const HomePage = () => {
  const { refCode } = useParams<{ refCode: string }>();
  const [referralCode, setReferralCode] = useLocalStorageState("referralCode");
  if (!referralCode && !!refCode) {
    setReferralCode(refCode);
    notify({ message: `New referral ${refCode} added`, variant: "success" });
  }
  if (!!referralCode && !!refCode && referralCode !== refCode) {
    setReferralCode(refCode);
    notify({
      message: `Referral code changed to ${refCode}`,
      variant: "success",
    });
  }
  return (
    <>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            marginTop: "5%",
            marginLeft: "21vw",
          }}
        >
          <Banner />
        </div>
        <div style={{ marginTop: "5%", marginBottom: "5%" }}>
          <VolumeSection />
        </div>
        <div style={{ marginRight: "6%" }}></div>
        <div id="nodes">
          <Grid container justify="center" alignItems="center" spacing={5}>
            <Grid item>
              <StakingCard />
            </Grid>
            <Grid item>
              <NodeCard />
            </Grid>
          </Grid>
        </div>
        <div style={{ marginTop: "5%" }} id="leaderboard">
          <Leaderboardsection />
        </div>
        <div style={{ marginTop: "5%", marginBottom: "5%" }}>
          <DecentralizedSection />
        </div>
      </div>
    </>
  );
};

export default HomePage;
