import React, { useState } from "react";
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
import { useLocalStorageState } from "../utils/utils";
import { notify } from "../utils/notifications";
import community from "../assets/homepage/community.svg";
import fast from "../assets/homepage/fast.svg";
import liquidity from "../assets/homepage/liquidity.svg";
import safe from "../assets/homepage/safe.svg";
import safeBlack from "../assets/homepage/safeBlack.svg";
import whitepaper from "../assets/homepage/whitepaper.svg";
import cubes from "../assets/homepage/cubes.svg";
import illusion from "../assets/homepage/illusion.svg";
import burn from "../assets/homepage/burn.svg";
import reward from "../assets/homepage/reward.svg";
import back from "../assets/homepage/back.svg";
import { useHistory } from "react-router";

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
});

const Banner = () => {
  const classes = useStyles();
  const history = useHistory();
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
          onClick={() => history.push("/trade/BTCPERP")}
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
    description: "Trade up to 15x leverage with near zero network fees.",
    icon: fast,
  },
  {
    title: "High liquidity",
    description: "Virtual AMMs provide deep liquidity from the start",
    icon: liquidity,
  },
  {
    title: "Safety first",
    description: "The protocol is backed by an insurance fund",
    icon: safe,
  },
  {
    title: "Community",
    description:
      "Host a UI or refer your friends and get 10% free of the fees!",
    icon: community,
  },
  {
    title: "Whitepaper",
    description: "Read the white paper on Arweave",
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
  return (
    <div className={classes.cardContainer}>
      <div className={classes.card}>
        <Typography className={classes.cardTitle}>Staking</Typography>
        <img src={burn} className={classes.cardIcon} alt="" />
        <Typography className={classes.cardSubtitle}>Buy and burn</Typography>
        <Typography className={classes.cardDescription}>
          30% of all fees generated go to FIDA buy and burns.
        </Typography>
        <img src={reward} className={classes.cardIcon} />
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

  const onClick = () => {
    setFront((prev) => !prev);
  };

  return (
    <div className={classes.cardContainer}>
      <div className={classes.card}>
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
                    <Button className={classes.button}>
                      <Typography className={classes.coloredText}>
                        Crank Liquidation
                      </Typography>
                    </Button>
                  </div>
                </Grid>
                <Grid item>
                  <div className={classes.buttonContainer}>
                    <Button className={classes.button}>
                      <Typography className={classes.coloredText}>
                        Crank Funding
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
      <Typography className={classes.h2}>
        Decentralized and open <br /> source
      </Typography>
      <Grid
        container
        justify="flex-start"
        alignItems="center"
        spacing={5}
        style={{ marginTop: 30 }}
      >
        <Grid item>
          <img
            src={solana}
            className={classes.imgDecentralizedSection}
            alt=""
          />
        </Grid>
        <Grid item>
          <img src={ipfs} className={classes.imgDecentralizedSection} alt="" />
        </Grid>
        <Grid item>
          <img
            src={github}
            className={classes.imgDecentralizedSection}
            alt=""
          />
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
        <div style={{ marginTop: "5%", marginLeft: "25vw" }}>
          <Banner />
        </div>
        <div
          style={{
            marginTop: "5%",
            marginBottom: "5%",
            marginLeft: "25vw",
          }}
        >
          <FeelTheDifference />
        </div>
        <div>
          <Grid container justify="center" alignItems="center" spacing={5}>
            <Grid item>
              <StakingCard />
            </Grid>
            <Grid item>
              <NodeCard />
            </Grid>
          </Grid>
        </div>
        <div style={{ marginTop: "5%", marginLeft: "25vw" }}>
          <DecentralizedSection />
        </div>
      </div>
    </>
  );
};

export default HomePage;
