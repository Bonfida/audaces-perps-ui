import React, { useState, useMemo } from "react";
import FloatingCard from "./FloatingCard";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import clsx from "clsx";
import {
  Input,
  FormControl,
  InputAdornment,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
} from "@material-ui/core";

const CssAppBar = withStyles({
  root: {
    backgroundColor: "transparent",
  },
})(AppBar);

enum Side {
  Buy,
  Sell,
}

enum UiOrderType {
  Limit,
  Market,
}

const useStyles = (arg) =>
  makeStyles({
    tabIndicator: {
      backgroundColor: arg.side === Side.Buy ? "#02C77A" : "#FF3B69",
    },
    tab: {
      fontSize: 14,
      fontWeight: 900,
      textTransform: "capitalize",
      width: "50%",
      minWidth: "50%",
    },
    buyTab: {
      color: "#4EDC76",
    },
    sellTab: {
      color: "#EB5252",
    },
    unselectedTab: {
      color: "rgb(124, 127, 131)",
    },
    inputAdornment: {
      color: "rgba(255,255, 255, 0.8)",
      textTransform: "uppercase",
      fontWeight: 800,
      fontSize: 14,
    },
    inputProps: {
      color: "white",
      width: "100%",
      fontSize: 16,
    },
    select: {
      color: "white",
      width: "100%",
      fontSize: 16,
    },
    formControlLabel: {
      color: "white",
      fontWeight: 800,
    },
    button: {
      color: "white",
      fontWeight: 800,
      textTransform: "capitalize",
      fontSize: 16,
      width: "90%",
      backgroundColor: arg.side === Side.Buy ? "#02C77A" : "#FF3B69",
      "&:hover": {
        backgroundColor: "rgb(0, 152, 192)  ",
      },
    },
    column: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "50%",
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      margin: "10px 20px 10px 20px",
    },
    header: {
      marginBottom: 20,
    },
    formControl: {
      width: "50%",
    },
    input: {
      width: "90%",
    },
    switchContainer: {
      width: 200,
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
    },
  });

const Header = ({
  marketName,
  side,
  handleChange,
}: {
  marketName: string;
  side: Side;
  handleChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
}) => {
  const classes = useStyles({ side })();
  return (
    <div className={classes.header}>
      <CssAppBar position="static" elevation={0}>
        <Tabs
          variant="fullWidth"
          value={side}
          onChange={handleChange}
          classes={{
            indicator: classes.tabIndicator,
          }}
        >
          <Tab
            className={clsx(
              classes.tab,
              side === Side.Buy ? classes.buyTab : classes.unselectedTab
            )}
            label={`Buy ${marketName}`}
          />
          <Tab
            className={clsx(
              classes.tab,
              side === Side.Sell ? classes.sellTab : classes.unselectedTab
            )}
            label={`Sell ${marketName}`}
          />
        </Tabs>
      </CssAppBar>
    </div>
  );
};

const TradeForm = () => {
  const [side, setSide] = useState(Side.Buy);
  const classes = useStyles({ side })();
  const [uiOrderType, setUiOrderType] = useState(UiOrderType.Limit);
  const [postOnly, setPostOnly] = useState(false);
  const [ioc, setIoc] = useState(false);

  const marketName = "BTC-PERP";

  const handleChangeSide = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSide(newValue);
  };

  const handleChangeOrderType = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setUiOrderType(event.target.value as UiOrderType);
  };

  const handleIocPostOnly = (
    state: boolean,
    otherState: boolean,
    setState: (arg: boolean) => void,
    setOtherState: (arg: boolean) => void
  ) => {
    const newState = !state;
    if (newState && otherState) {
      setOtherState(false);
    }
    setState(newState);
  };

  return (
    <FloatingCard padding="0 0 0 0">
      <Header
        side={side}
        handleChange={handleChangeSide}
        marketName={marketName}
      />
      <div className={classes.column}>
        <div className={classes.row}>
          <FormControl className={classes.formControl}>
            <Input
              className={classes.input}
              placeholder="Price"
              type="number"
              inputProps={{ className: classes.inputProps }}
              endAdornment={
                <InputAdornment position="end">
                  <span className={classes.inputAdornment}>USDC</span>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel shrink id="demo-simple-select-placeholder-label-label">
              Order type
            </InputLabel>
            <Select
              className={classes.input}
              inputProps={{ className: classes.select }}
              value={uiOrderType}
              onChange={handleChangeOrderType}
            >
              <MenuItem value={UiOrderType.Limit}>Limit</MenuItem>
              <MenuItem value={UiOrderType.Market}>Market</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className={classes.row}>
          <FormControl className={classes.formControl}>
            <Input
              className={classes.input}
              placeholder="Amount"
              type="number"
              inputProps={{ className: classes.inputProps }}
              endAdornment={
                <InputAdornment position="end">
                  <span className={classes.inputAdornment}>BTC</span>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <Input
              className={classes.input}
              placeholder="Amount"
              type="number"
              inputProps={{ className: classes.inputProps }}
              endAdornment={
                <InputAdornment position="end">
                  <span className={classes.inputAdornment}>USDC</span>
                </InputAdornment>
              }
            />
          </FormControl>
        </div>
        <div className={clsx(classes.row, classes.switchContainer)}>
          <FormControlLabel
            className={classes.formControlLabel}
            control={
              <Switch
                checked={postOnly && !ioc}
                onChange={() =>
                  handleIocPostOnly(postOnly, ioc, setPostOnly, setIoc)
                }
                name="post"
                color="primary"
              />
            }
            label="POST"
          />
          <FormControlLabel
            className={classes.formControlLabel}
            control={
              <Switch
                checked={ioc && !postOnly}
                onChange={() =>
                  handleIocPostOnly(ioc, postOnly, setIoc, setPostOnly)
                }
                name="ioc"
                color="primary"
              />
            }
            label="IOC"
          />
        </div>
        <div className={classes.buttonContainer}>
          <Button className={classes.button}>
            {side === Side.Buy ? "Buy" : "Sell"}
          </Button>
        </div>
      </div>
    </FloatingCard>
  );
};

export default TradeForm;
