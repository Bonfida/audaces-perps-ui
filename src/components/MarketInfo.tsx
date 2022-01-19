import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import getIcon from "../utils/icons";
import { Typography, Menu, MenuItem, Fade } from "@material-ui/core";
import { useMarket, useVolume, useUserAccount, MARKETS } from "../utils/market";
import { roundToDecimal, useSmallScreen } from "../utils/utils";
import Countdown from "react-countdown";
import useInterval from "../utils/useInterval";
import ArrowDropDownIcon from "../assets/components/topbar/arrow-down.svg";
import { Market } from "../utils/types";
import { useHistory } from "react-router-dom";

import { useOraclePrice } from "../hooks/useOralcePrice";
import { useMarkPrice } from "../hooks/useMarkPrice";
import { MARKET } from "@audaces/perps";

const useStyles = makeStyles({
  label: {
    fontSize: 14,
    color: "#77E3EF",
    fontWeight: 400,
  },
  value: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: 800,
  },
  img: {
    height: 24,
    marginRight: 8,
  },
  marketName: {
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 3,
  },
  marketDataContainer: {
    marginLeft: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  addButton: {
    background: "#02C77A",
    maxWidth: 300,
    width: "100%",
    border: "1px solid",
    color: "white",
    borderColor: "transparent",
    "&:hover": {
      color: "#02C77A",
      borderColor: "#02C77A",
      cursor: "pointer",
    },
  },
  fundingPopOver: {
    fontSize: 14,
  },
  divider: {
    background: "red",
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
  },
  headerContainer: {
    cursor: "pointer",
  },
  arrowDown: {
    color: "white",
    height: 6,
    marginTop: 5,
  },
  menuPaper: {
    background:
      "linear-gradient(90deg, rgba(18,23,33,1) 0%, rgba(19,30,48,1) 50%, rgba(18,23,33,1) 100%)",
  },
  infoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "0px 10px 0px 0px",
  },
  dropDownContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

const InfoColumn = ({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) => {
  const classes = useStyles();
  return (
    <div className={classes.infoContainer}>
      <Typography className={classes.label}>{label}</Typography>
      <Typography className={classes.value}>{value}</Typography>
    </div>
  );
};

export const Header = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { marketName, setMarket } = useMarket();
  const baseCurrency = marketName.split("-")[0];
  const history = useHistory();
  const xsScreen = useSmallScreen("xs");

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (m: Market) => {
    const path = m?.name?.split("-")?.join("");
    if (!path) {
      return setAnchorEl(null);
    }
    history.push("/trade/" + m?.name?.split("-")?.join(""));
    setMarket(m);
    setAnchorEl(null);
  };

  return (
    <>
      <div onClick={handleClick} className={classes.headerContainer}>
        <div className={classes.dropDownContainer}>
          <img src={getIcon(baseCurrency)} className={classes.img} alt="" />

          {!xsScreen && (
            <Typography className={classes.marketName} align="center">
              {marketName}
            </Typography>
          )}

          <img src={ArrowDropDownIcon} className={classes.arrowDown} alt="" />
        </div>
      </div>
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        keepMounted
        open={open}
        classes={{ paper: classes.menuPaper }}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {MARKETS.map((m, i) => {
          const _baseCurrency = m.name.split("-")[0];
          return (
            <MenuItem
              key={`market-menu-${i}`}
              onClick={() => handleClose(m)}
              style={{
                background:
                  marketName === m.name
                    ? "rgba(211, 211, 211, 0.3)"
                    : undefined,
              }}
            >
              <div className={classes.dropDownContainer}>
                <img
                  src={getIcon(_baseCurrency)}
                  className={classes.img}
                  alt=""
                />

                <Typography
                  style={{
                    fontWeight: 600,
                  }}
                  className={classes.marketName}
                  align="center"
                >
                  {m.name}
                </Typography>
              </div>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

const MarketData = () => {
  const classes = useStyles();
  const { marketState } = useMarket();
  const [indexPrice] = useOraclePrice();
  // const [volume] = useVolume(marketState?.marketAccount?.toBase58());
  const volume = 0; // TODO change
  const [markPrice] = useMarkPrice(MARKET);

  const [fundingCountdown, setFundingCountdown] = useState<number>(
    Date.now() + 60 * 60 * 1_000 - (Date.now() % (60 * 60 * 1_000))
  );

  const smallScreen = useSmallScreen();

  useInterval(() => {
    setFundingCountdown(
      Date.now() + 60 * 60 * 1_000 - (Date.now() % (60 * 60 * 1_000))
    );
  }, 10_000);

  return (
    <>
      <div className={classes.marketDataContainer}>
        {!!markPrice && (
          <InfoColumn
            label="Mark Price"
            value={`$${roundToDecimal(markPrice, 3)?.toLocaleString()}`}
          />
        )}
        {!!indexPrice && (
          <InfoColumn
            label="Index Price"
            value={`$${roundToDecimal(indexPrice, 3)?.toLocaleString()}`}
          />
        )}
        {!smallScreen && (
          <InfoColumn
            label="Next Funding"
            value={<Countdown date={fundingCountdown} />}
          />
        )}
        {!smallScreen && (
          <InfoColumn label="24h Volume" value={"$" + (volume || 0)} />
        )}
      </div>
    </>
  );
};

const MarketInfo = () => {
  return <MarketData />;
};

export default MarketInfo;
