import React, { useState, useEffect } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import { useHistory, useLocation } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import WalletConnect from "../WalletConnect";
import Settings from "../Settings";
import { useSmallScreen } from "../../utils/utils";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/MenuOpen";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import clsx from "clsx";
import { useLocalStorageState } from "../../utils/utils";
import HomeIcon from "@material-ui/icons/Home";
import BarChartIcon from "@material-ui/icons/BarChart";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";
import AssessmentIcon from "@material-ui/icons/Assessment";

const drawerWidth = 280;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    AppBar: {
      marginTop: "40px",
      background: "transparent",
    },
    logo: {
      color: "black",
    },
    audacesPerpetual: {
      fontSize: 20,
      fontWeight: 500,
      color: "black",
    },
    indicator: {
      backgroundColor: "#00ADB5",
    },
    hide: {
      display: "none",
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: "flex-end",
    },
    inputRoot: {
      padding: "2px 4px",
      display: "flex",
      alignItems: "center",
      width: "100%",
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
    walletConnect: { position: "absolute", right: 85, zIndex: 1 },
    settingsButton: { position: "absolute", right: 10, zIndex: 1 },
  })
);

const topBarElement = [
  {
    name: "home",
    href: "/",
    icon: <HomeIcon />,
  },
  {
    name: "trade",
    href: "/trade/BTCUSDC",
    icon: <BarChartIcon />,
  },
  {
    name: "nodes",
    href: "/nodes",
    icon: <AllInclusiveIcon />,
  },
  {
    name: "leaderboard",
    href: "/leaderboard",
    icon: <AssessmentIcon />,
  },
];

//  For white label UIs change this
export const Logo = () => {
  const classes = useStyles();
  return (
    <>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        // spacing={5}
      >
        {/* <Grid item>Put Logo here</Grid> */}
        <Grid item>
          <Typography align="center" className={classes.audacesPerpetual}>
            Audaces Perpetuals
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

const TopBar = () => {
  const location = useLocation();
  const history = useHistory();
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  const smallScreen = useSmallScreen();
  const [open, setOpen] = useLocalStorageState("showDrawer", true);

  useEffect(() => {
    if (location.pathname.includes("trade")) {
      setTab(1);
    } else if (location.pathname.includes("nodes")) {
      setTab(2);
    } else if (location.pathname.includes("leaderboard")) {
      setTab(3);
    } else {
      setTab(0);
    }
  }, [location.pathname]);

  return (
    <div className={classes.root}>
      <AppBar
        className={classes.AppBar}
        position="static"
        elevation={0}
        style={{ marginTop: 20 }}
      >
        <div style={{ position: "static", zIndex: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={() => {
              setOpen(true);
            }}
            style={{ color: "black" }}
            className={clsx(open && classes.hide)}
          >
            <MenuIcon style={{ color: "white", fontSize: 35 }} />
          </IconButton>
        </div>
        {!smallScreen && (
          <div className={classes.walletConnect}>
            <WalletConnect />
          </div>
        )}
        <div className={classes.settingsButton}>
          <Settings />
        </div>
      </AppBar>
      {open && <div style={{ marginTop: "59px" }} />}
      <Drawer
        className={classes.drawer}
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
        onClose={() => setOpen(false)}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <div
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "5%",
          }}
        >
          <WalletConnect />
        </div>
        <Divider />
        <List>
          {topBarElement.map((e, i) => {
            return (
              <ListItem
                button
                key={e.name}
                onClick={() => history.push(e.href)}
                selected={i === tab}
              >
                <ListItemIcon>{e.icon}</ListItemIcon>
                <ListItemText
                  primary={e.name}
                  style={{ textTransform: "capitalize" }}
                />
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </div>
  );
};

export default TopBar;
