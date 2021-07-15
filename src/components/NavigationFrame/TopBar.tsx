import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import { useHistory } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import WalletConnect from "../WalletConnect";
import Settings from "../Settings";
import { nanoid } from "nanoid";
import { Tab, Tabs } from "@material-ui/core";
import { useSmallScreen } from "../../utils/utils";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  AppBar: {
    marginTop: "40px",
    background: "transparent",
  },
  logo: {
    paddingLeft: "100px",
    cursor: "pointer",
  },
  buttonContainer: {
    paddingRight: "100px",
  },
  audacesPerpetual: {
    fontSize: 20,
    fontWeight: 500,
    color: "white",
  },
  tab: {
    color: "white",
    fontSize: 14,
  },
  indicator: {
    backgroundColor: "#00ADB5",
  },
});

const topBarElement = [
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
];

//  For white label UIs change this
const Logo = () => {
  const classes = useStyles();
  return (
    <>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        spacing={5}
      >
        <Grid item>{/* Put Logo here */}</Grid>
        <Grid item>
          <Typography className={classes.audacesPerpetual}>
            Audaces Perpetuals
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

const TABS = topBarElement.map(({ href }) => href);

const TopBar = () => {
  const history = useHistory();
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  const smallScreen = useSmallScreen();

  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
    history.push(TABS[newValue]);
  };

  useEffect(() => {
    if (window.location.href.includes("trade")) {
      setTab(1);
    } else if (window.location.href.includes("nodes")) {
      setTab(2);
    } else if (window.location.href.includes("ref")) {
      setTab(0);
    }
  }, []);

  return (
    <div className={classes.root}>
      <AppBar
        className={classes.AppBar}
        position="static"
        elevation={0}
        style={{ marginTop: 20 }}
      >
        <Grid
          container
          direction="row"
          justify={smallScreen ? "center" : "space-between"}
          alignItems="center"
        >
          {!smallScreen && (
            <>
              <Grid item>
                <Logo />
              </Grid>
            </>
          )}
          <Grid item>
            <AppBar
              className={classes.AppBar}
              position="static"
              elevation={0}
              style={{ marginTop: 0 }}
            >
              <Tabs
                value={tab}
                onChange={handleChangeTab}
                centered
                classes={{ indicator: classes.indicator }}
              >
                {topBarElement.map((e, i) => {
                  return (
                    <Tab
                      disableRipple
                      label={e.name}
                      className={classes.tab}
                      key={nanoid()}
                    />
                  );
                })}
              </Tabs>
            </AppBar>
          </Grid>
          {!smallScreen && (
            <Grid item className={classes.buttonContainer}>
              <Grid container justify="center" alignItems="center" spacing={4}>
                <Grid item>
                  <WalletConnect />
                </Grid>
                <Grid item>
                  <Settings />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </AppBar>
    </div>
  );
};

export default TopBar;
