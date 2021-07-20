import React from "react";
import staking from "../assets/homepage/staking.svg";
import node from "../assets/homepage/node.svg";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import HelpUrls from "../utils/HelpUrls";
import solana from "../assets/homepage/solana.png";
import builtOnSolana from "../assets/homepage/built_on_solana.svg";
import ipfs from "../assets/homepage/ipfs.png";
import fida from "../assets/homepage/fida.png";
import github from "../assets/homepage/github.png";
import Link from "../components/Link";
import { useParams } from "react-router-dom";
import { useLocalStorageState } from "../utils/utils";
import { notify } from "../utils/notifications";

const useStyles = makeStyles({
  imgStaking: {
    height: 300,
  },
  h2: {
    fontSize: "max(4vw, 40px)",
    fontWeight: 400,
    color: "white",
    marginTop: "2%",
    marginBottom: "2%",
  },
  subTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: 600,
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  imgNode: {
    height: 250,
  },
  button: {
    color: "white",
    background: "transparent",
    width: "auto",
    borderRadius: 5,
    height: "50px",
    border: "2px solid",
    borderColor: "#00ADB5",
    fontSize: 20,
    padding: 20,
  },
  h1: {
    fontSize: "max(5vw, 60px)",
    fontWeight: 400,
    color: "white",
    marginTop: "5%",
  },
  sectionContainer: {
    margin: "3%",
  },
  imgBuiltOnSolana: {
    width: "min(400px, 90%)",
  },
  clickableImg: {
    cursor: "pointer",
    transition: "transform .2s",
    "&:hover": {
      transform: "scale(1.04)",
    },
  },
  launchAppButton: {
    color: "white",
    fontWeight: 600,
    background: "linear-gradient(213.67deg, #DC1FFF -3.51%, #00ADB5 99.6%)",
    borderRadius: 5,
    height: "50px",
    fontSize: 30,
    padding: 30,
  },
  blackSection: {
    background: "rgb(9,11,15)",
    paddingBottom: 10,
    paddingTop: 10,
  },
  bannerContainer: {
    height: "25%",
    marginBottom: "3%",
  },
});

const Staking = () => {
  const classes = useStyles();
  const Text = () => {
    return (
      <>
        <Grid
          container
          justify="flex-start"
          alignItems="flex-start"
          direction="column"
          style={{ maxWidth: 500 }}
          spacing={5}
        >
          <Grid item>
            <Typography variant="body1" className={classes.subTitle}>
              Buy and Burn
            </Typography>
            <Typography variant="body1" className={classes.text}>
              30% of all fees generated go to FIDA buy and burns
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" className={classes.subTitle}>
              Staking Reward
            </Typography>
            <Typography variant="body1" className={classes.text}>
              10% of the monthly buy and burn will be airdropped on FIDA stakers
            </Typography>
          </Grid>
          <Grid item>
            <Button
              href={HelpUrls.stake}
              disableRipple
              className={classes.button}
            >
              Stake
            </Button>
          </Grid>
        </Grid>
      </>
    );
  };
  return (
    <div className={classes.sectionContainer}>
      <Typography variant="h2" className={classes.h2} align="center">
        Staking
      </Typography>
      <Grid
        container
        justify="center"
        alignItems="center"
        direction="row"
        spacing={10}
      >
        <Grid item>
          <Text />
        </Grid>
        <Grid item>
          <img src={staking} className={classes.imgStaking} alt="" />
        </Grid>
      </Grid>
    </div>
  );
};

const Node = () => {
  const classes = useStyles();
  const Text = () => {
    return (
      <>
        <Grid
          container
          justify="flex-start"
          alignItems="flex-start"
          direction="column"
          style={{ maxWidth: 500 }}
          spacing={5}
        >
          <Grid item>
            <Typography variant="body1" className={classes.subTitle}>
              Secure the network
            </Typography>
            <Typography variant="body1" className={classes.text}>
              Perpetual nodes secure the protocol by cranking liquidations and
              updating funding rates. Anyone can run a node and help secure the
              protocol
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" className={classes.subTitle}>
              Earn a reward
            </Typography>
            <Typography variant="body1" className={classes.text}>
              Nodes get rewarded with a flat fee for each transaction they crank
            </Typography>
          </Grid>
          <Grid item>
            <Button disableRipple className={classes.button}>
              Get Started
            </Button>
          </Grid>
        </Grid>
      </>
    );
  };
  return (
    <div className={classes.sectionContainer}>
      <Typography variant="h2" className={classes.h2} align="center">
        Perpetual Nodes
      </Typography>
      <Grid
        container
        justify="center"
        alignItems="center"
        direction="row"
        spacing={10}
      >
        <Grid item>
          <img src={node} className={classes.imgNode} alt="" />
        </Grid>
        <Grid item>
          <Text />
        </Grid>
      </Grid>
    </div>
  );
};

const Banner = () => {
  const classes = useStyles();
  return (
    <>
      <Typography align="center" className={classes.h1}>
        On-chain Perpetuals
      </Typography>
      <Grid container justify="center" style={{ marginTop: "5%" }}>
        <img src={builtOnSolana} className={classes.imgBuiltOnSolana} alt="" />
      </Grid>
      <Grid container justify="center" style={{ marginTop: "5%" }}>
        <Button
          href="/#/trade/BTCUSDC"
          disableRipple
          className={classes.launchAppButton}
        >
          Launch App
        </Button>
      </Grid>
    </>
  );
};

const Introduction = () => {
  const classes = useStyles();
  const Text = () => {
    return (
      <>
        <Grid
          container
          justify="flex-start"
          alignItems="flex-start"
          direction="column"
          style={{ maxWidth: 600 }}
          spacing={5}
        >
          <Grid item>
            <Typography variant="body1" className={classes.subTitle}>
              Fast and cheap
            </Typography>
            <Typography variant="body1" className={classes.text}>
              Trade up to 15x leverage with near 0 network fees
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" className={classes.subTitle}>
              High liquidity
            </Typography>
            <Typography variant="body1" className={classes.text}>
              Virtual AMMs provide deep liquidity from the start
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" className={classes.subTitle}>
              Safety First
            </Typography>
            <Typography variant="body1" className={classes.text}>
              The protocol is backed by an insurance fund
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" className={classes.subTitle}>
              Community
            </Typography>
            <Typography variant="body1" className={classes.text}>
              Host a UI or refer your friends and get 10% of the fees!
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" className={classes.subTitle}>
              White Paper
            </Typography>
            <Typography variant="body1" className={classes.text}>
              Read the white paper{" "}
              <Link
                style={{ color: "white" }}
                external
                to={HelpUrls.whitePaper}
              >
                on Arweave
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  };
  return (
    <div className={classes.sectionContainer}>
      <Typography variant="h2" className={classes.h2} align="center">
        Feel the Difference
      </Typography>
      <Grid
        container
        justify="center"
        alignItems="center"
        direction="row"
        spacing={10}
      >
        <Grid item>
          <Text />
        </Grid>
        <Grid item>
          <img src={fida} className={classes.imgNode} alt="" />
        </Grid>
      </Grid>
    </div>
  );
};

const Values = () => {
  const classes = useStyles();
  return (
    <>
      <Typography align="center" className={classes.h2}>
        Decentralized {"&"} Open Source
      </Typography>
      <Grid
        container
        justify="center"
        alignItems="center"
        direction="row"
        spacing={10}
      >
        <Grid item>
          <Link external to="https://solana.com">
            <img
              src={solana}
              height="100px"
              alt=""
              className={classes.clickableImg}
            />
          </Link>
        </Grid>
        <Grid item>
          <Link external to="https://ipfs.com">
            <img
              src={ipfs}
              height="110px"
              alt=""
              style={{ marginBottom: 20 }}
              className={classes.clickableImg}
            />
          </Link>
        </Grid>
        <Grid item>
          <Link external to="https://github.com/AudacesFoundation">
            <img
              src={github}
              height="110px"
              alt=""
              style={{ marginBottom: 20 }}
              className={classes.clickableImg}
            />
          </Link>
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
      <div className={classes.bannerContainer}>
        <Banner />
      </div>
      <div className={classes.blackSection}>
        <Introduction />
      </div>
      <Node />
      <div className={classes.blackSection}>
        <Staking />
      </div>
      <Values />
    </>
  );
};

export default HomePage;
