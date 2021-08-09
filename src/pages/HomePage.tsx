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
import community from "../assets/homepage/community.svg";
import fast from "../assets/homepage/fast.svg";
import liquidity from "../assets/homepage/liquidity.svg";
import safe from "../assets/homepage/safe.svg";
import safeBlack from "../assets/homepage/safeBlack.svg";
import whitepaper from "../assets/homepage/whitepaper.svg";
import cubes from "../assets/homepage/cubes.png";
import illusion from "../assets/homepage/illusion.svg";
import burn from "../assets/homepage/burn.svg";
import reward from "../assets/homepage/reward.svg";
import back from "../assets/homepage/back.svg";
import { useHistory } from "react-router";
import cubeBottom from "../assets/homepage/cube-bottom.svg";
import { useVolume, useLeaderBoard, MARKETS } from "../utils/market";
import LeaderboardTable from "../components/LeaderBoardTable";
import { Trader } from "../utils/types";
import {
  useSmallScreen,
  useWindowSize,
  useLocalStorageState,
} from "../utils/utils";
import { useWallet } from "../utils/wallet";
import { useConnection } from "../utils/connection";
import { crankLiquidation, crankFunding } from "@audaces/perps";
import { sendSignedTransaction, signTransactions } from "../utils/send";
import { PublicKey, Transaction } from "@solana/web3.js";
import Spin from "../components/Spin";

const useStyles = makeStyles({
  h1: {
    color: "#FFFFFF",
    textShadow:
      "0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)",
    fontSize: 68,
    margin: 10,
    fontWeight: 800,
    lineHeight: "1.0em",
  },
  h2: {
    color: "#FFFFFF",
    textShadow:
      "0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)",
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
    borderRadius: 20,
    margin: 1,
    textTransform: "capitalize",
    width: 200,
    color: "#77E3EF",
    fontWeight: 700,
    "&:hover": {
      background:
        "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
    },
  },
  startTradingButtonContainer: {
    background: "linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)",
    borderRadius: 25,
    width: 202,
    marginTop: 20,
    marginLeft: 10,
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
  cardContainer: {
    background: "linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)",
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    width: 600,
    height: 540,
    "&:hover": {
      background: "linear-gradient(135deg, #37BCBD 0%, #B846B2 100%)",
    },
  },
  card: {
    padding: 25,
    borderRadius: 16,
    height: "538px",
    width: "100%",
    margin: 1,
    background:
      "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 61.99%)",
    "&:hover": {
      boxShadow:
        "0px 4px 36px -7px rgba(255, 255, 255, 0.03), 0px -1px 81px 17px rgba(255, 255, 255, 0.05)",
    },
  },
  cardTitle: {
    color: "#FFFFFF",
    textShadow:
      "0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)",
    fontSize: 68,
    margin: 10,
    fontWeight: 800,
    lineHeight: "1.0em",
  },
  cardSubtitle: {
    color: "rgba(192, 169, 199, 1)",
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
    bottom: -10,
    right: -50,
    zIndex: -1,
  },
  volumeColoredText: {
    textTransform: "capitalize",
    fontWeight: 800,
    fontSize: 110,
    backgroundImage: "linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)",
    backgroundClip: "text",
    textShadow:
      "0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)",
    color: "rgba(119, 227, 239, 0.28)",
    "-webkit-background-clip": "text",
    "-moz-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
    "-moz-text-fill-color": "transparent",
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
  wolveCardSelected: {
    justifyContent: "center",
    display: "flex",
    borderRadius: 16,
    height: 101,
    width: 196,
    margin: 1,
    background:
      "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 61.99%)",
    "&:hover": {
      cursor: "pointer",
      boxShadow:
        "0px 4px 36px -7px rgba(255, 255, 255, 0.03), 0px -1px 81px 17px rgba(255, 255, 255, 0.05)",
    },
  },
  wolveCard: {
    justifyContent: "center",
    display: "flex",
    borderRadius: 16,
    height: 101,
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
    backgroundImage: "linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)",
    backgroundClip: "text",
    textShadow:
      "0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)",
    color: "rgba(119, 227, 239, 0.28)",
    "-webkit-background-clip": "text",
    "-moz-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
    "-moz-text-fill-color": "transparent",
  },
  wolveCardText: {
    textTransform: "capitalize",
    fontWeight: 600,
    fontSize: 42,
    color: "#FFFFFF",
    textShadow:
      "0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)",
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

const feelSections = [
  {
    title: "Fast and cheap",
    description: <>Trade up to 15x leverage with near zero network fees.</>,
    icon: fast,
  },
  {
    title: "High liquidity",
    description: <>Virtual AMMs provide deep liquidity from the start</>,
    icon: liquidity,
  },
  {
    title: "Safety first",
    description: <>The protocol is backed by an insurance fund</>,
    icon: safe,
  },
  {
    title: "Community",
    description: <>Host a UI or refer your friends and get 10% the fees!</>,
    icon: community,
  },
  {
    title: "Whitepaper",
    description: (
      <>
        Read the white paper on{" "}
        <Link
          external
          to={HelpUrls.whitePaper}
          style={{ color: "white", textDecoration: "none", fontWeight: 800 }}
        >
          Arweave
        </Link>
      </>
    ),
    icon: whitepaper,
  },
];

const FeelTheDifference = () => {
  const classes = useStyles();
  return (
    <>
      <Typography className={classes.h2}>Feel the difference</Typography>
      <Grid
        container
        justify="flex-start"
        alignItems="center"
        spacing={5}
        style={{ marginTop: 30 }}
      >
        {feelSections.map((s, i) => {
          return (
            <Grid item key={`feel-difference-section-${i}`}>
              <img src={s.icon} className={classes.imgFeelSection} alt="" />
              <Typography className={classes.titleFeelSection}>
                {s.title}
              </Typography>
              <Typography className={classes.descriptionFeelSection}>
                {s.description}
              </Typography>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

const StakingCard = () => {
  const classes = useStyles();
  const smallScreen = useSmallScreen();
  return (
    <div
      className={classes.cardContainer}
      style={{
        width: smallScreen ? "auto" : "undefined",
        height: smallScreen ? "auto" : "undefined",
        margin: smallScreen ? 15 : "undefined",
      }}
    >
      <div
        className={classes.card}
        style={{
          width: smallScreen ? "auto" : "undefined",
          height: smallScreen ? "auto" : "undefined",
        }}
      >
        <Typography className={classes.cardTitle}>Staking</Typography>
        <img src={burn} className={classes.cardIcon} alt="" />
        <Typography className={classes.cardSubtitle}>Buy and burn</Typography>
        <Typography className={classes.cardDescription}>
          30% of all fees generated go to FIDA buy and burns.
        </Typography>
        <img src={reward} className={classes.cardIcon} alt="" />
        <Typography className={classes.cardSubtitle}>Staking reward</Typography>
        <Typography className={classes.cardDescription}>
          10% of the monthly buy and burn will be airdropped on FIDA stakers.
        </Typography>
        <div
          className={classes.buttonContainer}
          style={{ marginTop: "min(10%, 40px)" }}
        >
          <Link external to={HelpUrls.stake} className={classes.link}>
            <Button className={classes.button}>
              <Typography className={classes.coloredText}>
                Start staking
              </Typography>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const NodeCard = () => {
  const classes = useStyles();
  const [front, setFront] = useState(true);
  const smallScreen = useSmallScreen();
  const { wallet, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const connection = useConnection();

  const onClick = () => {
    setFront((prev) => !prev);
  };

  const onClickLiquidation = async () => {
    if (!connected || !wallet?.publicKey) {
      notify({
        message: "Connect your wallet",
      });
      return;
    }

    try {
      setLoading(true);
      const [, instructions] = await crankLiquidation(
        connection,
        wallet?.publicKey,
        new PublicKey(MARKETS[0].address)
      );
      const signed = await signTransactions({
        transactionsAndSigners: instructions.map((i) => {
          return { transaction: new Transaction().add(i) };
        }),
        connection: connection,
        wallet: wallet,
      });

      for (let signedTransaction of signed) {
        await sendSignedTransaction({ signedTransaction, connection });
      }
    } catch (err) {
      if (err.message.includes("no-op")) {
        return notify({
          message: `No liquidation to crank`,
          variant: "success",
        });
      }
      console.warn(`Error - ${err}`);
      notify({
        message: `Error cranking transaction - ${err}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const onClickFunding = async () => {
    if (!connected) {
      notify({
        message: "Connect your wallet",
      });
      return;
    }
    try {
      setLoading(true);
      const [, instructions] = await crankFunding(
        connection,
        new PublicKey(MARKETS[0].address)
      );
      const signed = await signTransactions({
        transactionsAndSigners: instructions.map((i) => {
          return { transaction: new Transaction().add(i) };
        }),
        connection: connection,
        wallet: wallet,
      });

      for (let signedTransaction of signed) {
        await sendSignedTransaction({ signedTransaction, connection });
      }
    } catch (err) {
      if (err.message.includes("no-op")) {
        return notify({ message: `No funding to crank`, variant: "success" });
      }
      console.warn(`Error - ${err}`);
      notify({
        message: `Error cranking transaction - ${err}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={classes.cardContainer}
      style={{
        width: smallScreen ? "auto" : undefined,
        margin: smallScreen ? 5 : undefined,
        height: smallScreen ? "auto" : undefined,
      }}
    >
      <div
        className={classes.card}
        style={{
          width: smallScreen ? "auto" : undefined,
          height: smallScreen ? "auto" : undefined,
        }}
      >
        {front && (
          <>
            <Typography className={classes.cardTitle}>Nodes</Typography>
            <img src={safeBlack} className={classes.cardIcon} alt="" />
            <Typography className={classes.cardSubtitle}>
              Secure the network
            </Typography>
            <img src={reward} className={classes.cardIcon} alt="" />
            <Typography className={classes.cardSubtitle}>
              Earn a reward
            </Typography>
            <Typography className={classes.cardDescription}>
              Nodes get rewarded for each transaction they crank.
            </Typography>
            <div
              className={classes.buttonContainer}
              style={{ marginTop: "min(10%, 40px)" }}
            >
              <Button className={classes.button} onClick={onClick}>
                <Typography className={classes.coloredText}>
                  Learn how
                </Typography>
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
                updating funding rates. Anyone can run a node and help secure
                the protocol
              </Typography>
              <Typography className={classes.nodeColoredText}>
                Set up your node
              </Typography>
              <Typography className={classes.cardDescription}>
                Anyone can set up a node and start cranking! Cranking can be
                done using the JavaScript SDK available on NPM or a Rust
                executable available on Github.
              </Typography>
              <Typography className={classes.nodeColoredText}>
                Crank manually
              </Typography>
              <Typography className={classes.cardDescription}>
                You can crank liquidations and funding rates manually and try
                earning a rewards!
              </Typography>
              <Grid
                container
                justify="flex-start"
                alignItems="center"
                spacing={5}
                style={{ marginTop: 10 }}
              >
                <Grid item>
                  <div className={classes.buttonContainer}>
                    <Button
                      className={classes.button}
                      onClick={onClickLiquidation}
                    >
                      <Typography className={classes.coloredText}>
                        {loading ? <Spin size={10} /> : <>Crank Liquidation</>}
                      </Typography>
                    </Button>
                  </div>
                </Grid>
                <Grid item>
                  <div className={classes.buttonContainer}>
                    <Button className={classes.button} onClick={onClickFunding}>
                      <Typography className={classes.coloredText}>
                        {loading ? <Spin size={10} /> : <>Crank Funding</>}
                      </Typography>
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </div>
          </Fade>
        )}
      </div>
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
    <>
      <Typography className={classes.h2} align="right">
        Our trading volumes
      </Typography>
      <Typography
        className={classes.volumeColoredText}
        style={{ fontSize: smallScreen ? "4rem" : undefined }}
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
    </>
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
          <img
            alt=""
            src={cubes}
            style={{
              width: "70%",
              marginLeft: "10%",
            }}
          />
        </Grid>
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
    <div className={classes.wolveCardContainer}>
      <div className={classes.wolveCardSelected}>
        <div>
          <Typography className={classes.wolveCardTextSelected}>
            {time}
          </Typography>
          <Typography className={classes.wolveCardSubtitle}>Leaders</Typography>
        </div>
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
  const classes = useStyles();
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
        <img src={illusion} className={classes.illusion} alt="" />
        <div style={{ marginTop: "5%", marginLeft: "21vw" }}>
          <Banner />
        </div>
        <div
          style={{
            marginTop: "5%",
            marginBottom: "5%",
            marginLeft: "21vw",
          }}
        >
          <FeelTheDifference />
        </div>
        <div style={{ marginRight: "6%" }}>
          <VolumeSection />
        </div>
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
        <img src={cubeBottom} className={classes.cubeBottom} alt="" />
      </div>
    </>
  );
};

export default HomePage;
