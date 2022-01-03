import React, { useState, useEffect } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { useLocation } from "react-router-dom";
import fida from "../../assets/homepage/fida.png";
import { Typography, Grid, Button } from "@material-ui/core";
import WalletConnect from "../WalletConnect";
import gear from "../../assets/components/topbar/gear.svg";
import Switch from "../Switch";
import MarketInfo from "../MarketInfo";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { notify } from "../../utils/notifications";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMarket } from "../../utils/market";
import { useLayout } from "../../utils/layout";
import { useHistory } from "react-router";
import {
  useSmallScreen,
  useWindowSize,
  useLocalStorageState,
} from "../../utils/utils";
import { Header } from "../MarketInfo";

const drawerWidth = 300;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      background: "rgba(15, 15, 17, 0.85)",
      backdropFilter: "blur(4px)",
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: "flex-start",
    },
    resetLayetButton: {
      background:
        "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
      margin: 1,
      borderRadius: 20,
      width: 290,
      "&:hover": {
        background:
          "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)",
      },
    },
    resetLayetButtonContainer: {
      background: "linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)",
      borderRadius: 25,
      width: 292,
    },
    text: {
      fontSize: 18,
      fontWeight: 600,
    },
    sectionsContainer: {
      marginLeft: 20,
      marginRight: 20,
      display: "flex",
      justifyContent: "space-between",
    },
    sectionItem: {
      marginRight: 10,
      marginLeft: 10,
    },
    sectionName: {
      color: "#FFFFFF",
      fontSize: 18,
      textTransform: "capitalize",
      "&:hover": {
        cursor: "pointer",
      },
    },
    fida: {
      height: 38,
      cursor: "pointer",
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
      justifyContent: "space-around",
      alignItems: "center",
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
    drawerText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: 400,
    },
    topBarMarketPageContainer: {
      marginTop: 20,
      background: "#141722",
      paddingTop: 15,
      paddingBottom: 10,
      paddingLeft: 20,
      paddingRight: 20,
    },
  })
);

const topBarElements = [
  {
    name: "trade",
    href: "/trade/BTCUSDC",
  },
  {
    name: "leaderboard",
    href: "/leaderboard",
  },
];

const Sections = () => {
  const classes = useStyles();
  const history = useHistory();
  return (
    <Grid container justify="flex-start" alignItems="center" spacing={5}>
      <Grid item>
        <img
          src={fida}
          className={classes.fida}
          alt=""
          onClick={() => history.push("/")}
        />
      </Grid>
      {topBarElements.map((e) => {
        return (
          <Grid item key={`section-top-bar-${e.name}`}>
            <div onClick={() => history.push(e.href)}>
              <Typography className={classes.sectionName}>{e.name}</Typography>
            </div>
          </Grid>
        );
      })}
      <Grid item>
        <Header />
      </Grid>
    </Grid>
  );
};

const TopBarHomePage = () => {
  const classes = useStyles();
  const smallScreen = useSmallScreen();
  if (smallScreen) {
    return null;
  }
  return (
    <div
      style={{
        marginTop: 30,
      }}
    >
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
  const [open, setOpen] = useState(false);
  const { connected } = useWallet();
  const { locked, setLocked, resetLayout } = useLayout();
  const { useIsolatedPositions, setUseIsolatedPositions, userAccount } =
    useMarket();
  const history = useHistory();
  const [refCode] = useLocalStorageState("referralCode");
  const { width } = useWindowSize();
  const smallScreen = width < 1125;
  const handleChangeIsolatedPositions = () => {
    // If no userAccount
    if (!userAccount?.openPositions) {
      setUseIsolatedPositions(!useIsolatedPositions);
    }
    // If 0 or 1 position can use isolated positions
    else if (userAccount?.openPositions.length <= 1) {
      setUseIsolatedPositions(!useIsolatedPositions);
    }
    // If 1 < positions can only use isolated positions
    else if (useIsolatedPositions) {
      notify({
        message:
          "You need to have only 1 position open to turn off the isolated positions mode",
      });
    } else {
      setUseIsolatedPositions(!useIsolatedPositions);
    }
  };

  useEffect(() => {
    if (!connected || !userAccount) return;
    if (
      !!userAccount?.openPositions &&
      userAccount?.openPositions.length > 1 &&
      !useIsolatedPositions
    ) {
      setUseIsolatedPositions(true);
    }
  }, [connected, useIsolatedPositions, setUseIsolatedPositions, userAccount]);

  return (
    <>
      {smallScreen && (
        <>
          <div style={{ margin: 20 }}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <img
                  onClick={() => history.push("/")}
                  src={fida}
                  className={classes.fida}
                  alt=""
                  style={{ marginRight: 40 }}
                />
              </Grid>
              <Grid item>
                <div
                  onClick={() => setOpen(true)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={gear} style={{ height: 21 }} alt="" />
                </div>
              </Grid>
            </Grid>
          </div>
          <div style={{ margin: 20 }}>
            <MarketInfo />
          </div>
        </>
      )}
      {!smallScreen && (
        <div className={classes.topBarMarketPageContainer}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <MarketInfo />
            </Grid>
            <Grid item>
              <div onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
                <img src={gear} style={{ height: 21 }} alt="" />
              </div>
            </Grid>
          </Grid>
        </div>
      )}
      <Drawer
        className={classes.drawer}
        classes={{ paper: classes.paper }}
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className={classes.drawerHeader}>
          <List>
            {/* Lock Layout */}
            <ListItem>
              <Grid
                container
                justify="space-between"
                alignItems="center"
                spacing={5}
              >
                <Grid item>
                  <Typography className={classes.drawerText}>
                    Lock layout
                  </Typography>
                </Grid>
                <Grid item>
                  <Switch
                    checked={locked}
                    onChange={() => setLocked(!locked)}
                  />
                </Grid>
              </Grid>
            </ListItem>
            {/* Isolated Position */}
            <ListItem>
              <Grid
                container
                justify="space-between"
                alignItems="center"
                spacing={5}
              >
                <Grid item>
                  <Typography className={classes.drawerText}>
                    Isolated positions
                  </Typography>
                </Grid>
                <Grid item>
                  <Switch
                    checked={useIsolatedPositions}
                    onChange={handleChangeIsolatedPositions}
                  />
                </Grid>
              </Grid>
            </ListItem>
            {/* Referrer */}
            {!!refCode && (
              <ListItem>
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  spacing={5}
                >
                  <Grid item>
                    <Typography className={classes.drawerText}>
                      Your referrer
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography className={classes.drawerText}>
                      {refCode}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
            )}
            {/* Small screen wallet connect */}
            {smallScreen && (
              <ListItem>
                <WalletConnect />
              </ListItem>
            )}
            {/* Reset layout */}
            <ListItem>
              <div className={classes.resetLayetButtonContainer}>
                <Button
                  className={classes.resetLayetButton}
                  onClick={resetLayout}
                >
                  <Typography className={classes.coloredText}>
                    Reset Layout
                  </Typography>
                </Button>
              </div>
            </ListItem>
          </List>
        </div>
      </Drawer>
    </>
  );
};

const TopBar = () => {
  const location = useLocation();
  const isTradePage = location.pathname.includes("/trade");
  if (isTradePage) {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <TopBarHomePage />
        <TopBarMarketPage />
      </div>
    );
  }
  return <TopBarHomePage />;
};

export default TopBar;
