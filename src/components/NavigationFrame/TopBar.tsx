import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { useHistory, useLocation } from "react-router-dom";
import fida from "../../assets/homepage/fida.png";
import { Typography, Grid, Divider } from "@material-ui/core";
import WalletConnect from "../WalletConnect";
import gear from "../../assets/components/topbar/gear.svg";
import MarketInfo from "../MarketInfo";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    connectButton: {
      background:
        "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
      margin: 1,
      borderRadius: 20,
      width: 148,
      "&:hover": {
        background:
          "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
      },
    },
    text: {
      fontSize: 18,
      fontWeight: 600,
    },
    sectionsContainer: {
      display: "flex",
      justifyContent: "space-around",
    },
    sectionItem: {
      marginRight: 10,
      marginLeft: 10,
    },
    sectionName: {
      color: "#FFFFFF",
      fontSize: 18,
      textTransform: "capitalize",
    },
    fida: {
      height: 38,
    },
    divider: {
      background: "#9BA3B5",
      width: 1,
      height: 24,
      marginLeft: 20,
      marginRight: 20,
    },
    settingsContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  })
);

const topBarElements = [
  {
    name: "home",
    href: "/",
  },
  {
    name: "trade",
    href: "/trade/BTCUSDC",
  },
  {
    name: "nodes",
    href: "/nodes",
  },
  {
    name: "leaderboard",
    href: "/leaderboard",
  },
];

const Sections = () => {
  const classes = useStyles();
  return (
    <Grid container justify="flex-start" alignItems="center" spacing={5}>
      <Grid item>
        <img src={fida} className={classes.fida} alt="" />
      </Grid>
      {topBarElements.map((e) => {
        return (
          <Grid item key={`section-top-bar-${e.name}`}>
            <Typography className={classes.sectionName}>{e.name}</Typography>
          </Grid>
        );
      })}
    </Grid>
  );
};

const TopBarHomePage = () => {
  const classes = useStyles();
  return (
    <div style={{ marginLeft: "10%", marginRight: "10%", marginTop: 30 }}>
      <div className={classes.sectionsContainer}>
        <div>
          <Sections />
        </div>
        <div>
          <WalletConnect />
        </div>
      </div>
    </div>
  );
};

const TopBarMarketPage = () => {
  const classes = useStyles();
  return (
    <div
      style={{
        marginTop: 20,
        background: "#141722",
        paddingTop: 15,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <Grid container justify="space-between">
        <Grid item>
          <div className={classes.settingsContainer}>
            <img
              src={fida}
              className={classes.fida}
              alt=""
              style={{ marginRight: 40 }}
            />
            <MarketInfo />
          </div>
        </Grid>
        <Grid item>
          <div className={classes.settingsContainer}>
            <WalletConnect />
            <Divider orientation="vertical" className={classes.divider} />
            <img src={gear} style={{ height: 21 }} />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

const TopBar = () => {
  const location = useLocation();
  const isHomagePage = location.pathname === "/";
  if (isHomagePage) {
    return <TopBarHomePage />;
  }
  return <TopBarMarketPage />;
};

export default TopBar;
