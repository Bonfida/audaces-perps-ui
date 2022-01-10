import React, { useState } from "react";
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
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import {
  placeOrder,
  OrderType,
  AUDACES_ID,
  MARKET,
  ECOSYSTEM,
  Ecosystem,
  MarketState,
  Side,
} from "@audaces/perps";
import { notify } from "../utils/notifications";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { SelfTradeBehavior } from "@bonfida/aob";
import { sendTx } from "../utils/send";
import Spin from "./Spin";

const CssAppBar = withStyles({
  root: {
    backgroundColor: "transparent",
  },
})(AppBar);

const CssSelect = withStyles({
  icon: {
    color: "white",
  },
})(Select);

enum UiOrderType {
  Limit,
  Market,
}

const useStyles = (arg) =>
  makeStyles({
    tabIndicator: {
      backgroundColor: arg.side === Side.Bid ? "#02C77A" : "#FF3B69",
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
      backgroundColor: arg.side === Side.Bid ? "#02C77A" : "#FF3B69",
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
      margin: "5px 10px 0px 10px",
    },
    swapIcon: {
      margin: "0px 5px 0px 5px",
      backgroundColor: arg.side === Side.Bid ? "#FF3B69" : "#02C77A",
      "&:hover": {
        backgroundColor: "rgb(0, 152, 192)  ",
      },
    },
    arrowDropDownIcon: {
      color: "white",
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
            value={Side.Bid}
            className={clsx(
              classes.tab,
              side === Side.Bid ? classes.buyTab : classes.unselectedTab
            )}
            label={`Buy ${marketName}`}
          />
          <Tab
            value={Side.Ask}
            className={clsx(
              classes.tab,
              side === Side.Ask ? classes.sellTab : classes.unselectedTab
            )}
            label={`Sell ${marketName}`}
          />
        </Tabs>
      </CssAppBar>
    </div>
  );
};

const marketPriceFromSide = (side: Side): number => {
  switch (side) {
    case Side.Bid:
      return Number.MAX_SAFE_INTEGER;
    default:
      return 0;
  }
};

const TradeForm = () => {
  const [side, setSide] = useState(Side.Bid);
  const classes = useStyles({ side })();
  const [uiOrderType, setUiOrderType] = useState(UiOrderType.Limit);
  const [postOnly, setPostOnly] = useState(false);
  const [price, setPrice] = useState<null | number>(null);
  const [size, setSize] = useState<null | number>(null);
  const [ioc, setIoc] = useState(false);
  const [loading, setLoading] = useState(false);
  const { sendTransaction, publicKey, connected } = useWallet();
  const { connection } = useConnection();

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

  const handleChangeSize = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (isNaN(value) || !isFinite(value) || value < 0) {
      return;
    }
    setSize(value);
  };

  const handleChangePrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (isNaN(value) || !isFinite(value) || value < 0) {
      return;
    }
    setPrice(value);
  };

  const handlePlaceOrder = async () => {
    if (!publicKey || !price || !size) return;
    try {
      setLoading(true);
      const marketIndex = 0;
      const parsedPrice =
        uiOrderType === UiOrderType.Market ? marketPriceFromSide(side) : price;
      const parsedSize = size * Math.pow(10, 6);
      const orderType = postOnly
        ? OrderType.PostOnly
        : ioc || uiOrderType === UiOrderType.Market
        ? OrderType.IOC
        : OrderType.Limit;

      const ecosystem = await Ecosystem.retrieve(connection, ECOSYSTEM);
      const market = await MarketState.retrieve(connection, MARKET);

      const order_ix = await placeOrder(
        publicKey,
        side,
        marketIndex,
        parsedSize,
        parsedPrice,
        SelfTradeBehavior.CancelProvide,
        orderType,
        AUDACES_ID,
        MARKET,
        ECOSYSTEM,
        ecosystem,
        market,
        undefined, // TODO discount account
        undefined, // TODO discount owner
        undefined // TODO referrer
      );

      await sendTx(
        connection,
        publicKey,
        order_ix.instructions,
        sendTransaction
      );
    } catch (err) {
      notify({ message: "Error placing order", variant: "error" });
      console.log(err);
    } finally {
      setLoading(false);
    }
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
              onChange={handleChangePrice}
              inputProps={{
                className: classes.inputProps,
                min: 0,
                type: "number",
              }}
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
            <CssSelect
              className={classes.input}
              inputProps={{ className: classes.select }}
              value={uiOrderType}
              onChange={handleChangeOrderType}
            >
              <MenuItem value={UiOrderType.Limit}>Limit</MenuItem>
              <MenuItem value={UiOrderType.Market}>Market</MenuItem>
            </CssSelect>
          </FormControl>
        </div>
        <div className={classes.row}>
          <FormControl className={classes.formControl}>
            <Input
              className={classes.input}
              onChange={handleChangeSize}
              placeholder="Amount"
              type="number"
              inputProps={{ className: classes.inputProps, min: 0 }}
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
              inputProps={{ className: classes.inputProps, min: 0 }}
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
          <Button
            disabled={!connected}
            onClick={handlePlaceOrder}
            className={classes.button}
          >
            {loading ? <Spin size={20} /> : side === Side.Bid ? "Buy" : "Sell"}
          </Button>
          <Button
            onClick={() =>
              setSide((prev) => (prev === Side.Bid ? Side.Ask : Side.Bid))
            }
            className={classes.swapIcon}
          >
            <SwapHorizIcon />
          </Button>
        </div>
      </div>
    </FloatingCard>
  );
};

export default TradeForm;
