import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import getIcon from "../utils/icons";
import { Grid, Typography, Menu, MenuItem, Fade } from "@material-ui/core";
import FloatingCard from "./FloatingCard";
import { useOraclePrice } from "../utils/perpetuals";
import {
  useMarkPrice,
  useMarket,
  useVolume,
  useUserAccount,
  getFundingRate,
  MARKETS,
} from "../utils/market";
import { roundToDecimal, USDC_DECIMALS, useSmallScreen } from "../utils/utils";
import MouseOverPopOver from "./MouseOverPopOver";
import Countdown from "react-countdown";
import useInterval from "../utils/useInterval";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { Market } from "../utils/types";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles({
  label: {
    fontSize: 14,
    color: "white",
    fontWeight: 600,
  },
  value: {
    fontSize: 14,
    color: "white",
  },
  img: {
    height: 35,
    marginTop: 4,
  },
  marketName: {
    fontSize: 20,
    opacity: 0.9,
    color: "white",
  },
  marketDataContainer: {},
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
    fontSize: 20,
    marginTop: 5,
  },
  menuPaper: {
    background:
      "linear-gradient(90deg, rgba(18,23,33,1) 0%, rgba(19,30,48,1) 50%, rgba(18,23,33,1) 100%)",
  },
});

const InfoColumn = ({ label, value }: { label: string; value: any }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction="column"
      justify="space-between"
      alignItems="center"
    >
      <Grid item>
        <Typography className={classes.label}>{label}</Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.value}>{value}</Typography>
      </Grid>
    </Grid>
  );
};

const Header = () => {
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
    history.push(m?.name?.split("-")?.join(""));
    setMarket(m);
    setAnchorEl(null);
  };

  return (
    <>
      <div onClick={handleClick} className={classes.headerContainer}>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item>
            <img src={getIcon(baseCurrency)} className={classes.img} alt="" />
          </Grid>
          {!xsScreen && (
            <Grid item>
              <Typography className={classes.marketName} align="center">
                {marketName}
              </Typography>
            </Grid>
          )}
          <Grid item>
            <ArrowDropDownIcon className={classes.arrowDown} />
          </Grid>
        </Grid>
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
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                spacing={2}
              >
                <Grid item>
                  <img
                    src={getIcon(_baseCurrency)}
                    className={classes.img}
                    alt=""
                  />
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      fontWeight: 600,
                    }}
                    className={classes.marketName}
                    align="center"
                  >
                    {m.name}
                  </Typography>
                </Grid>
              </Grid>
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
  const userAccount = useUserAccount();
  const [indexPrice] = useOraclePrice(marketState?.marketAccount);
  const markPrice = useMarkPrice();
  const [volume] = useVolume(marketState?.marketAccount?.toBase58());
  const fundingRatios = getFundingRate(marketState);
  const [fundingCountdown, setFundingCountdown] = useState<number>(
    Date.now() + 60 * 60 * 1_000 - (Date.now() % (60 * 60 * 1_000))
  );

  useInterval(() => {
    setFundingCountdown(
      Date.now() + 60 * 60 * 1_000 - (Date.now() % (60 * 60 * 1_000))
    );
  }, 10_000);

  return (
    <>
      <div className={classes.marketDataContainer}>
        <Grid
          container
          justify="space-around"
          alignItems="center"
          direction="row"
          spacing={5}
        >
          <Grid item>
            <Header />
          </Grid>
          {!!userAccount?.balance && (
            <Grid item>
              <InfoColumn
                label="Available Collateral"
                value={
                  <>
                    {roundToDecimal(
                      userAccount?.balance / USDC_DECIMALS,
                      3
                    )?.toLocaleString()}{" "}
                    <strong>USDC</strong>
                  </>
                }
              />
            </Grid>
          )}
          {!!markPrice && (
            <Grid item>
              <InfoColumn
                label="Mark Price"
                value={`$${roundToDecimal(markPrice, 3)?.toLocaleString()}`}
              />
            </Grid>
          )}
          {!!indexPrice?.price && (
            <Grid item>
              <InfoColumn
                label="Index Price"
                value={`$${roundToDecimal(
                  indexPrice?.price,
                  3
                )?.toLocaleString()}`}
              />
            </Grid>
          )}
          {!!fundingRatios &&
            !!fundingRatios.fundingRatioLongs &&
            !isNaN(fundingRatios.fundingRatioLongs) &&
            !!fundingRatios.fundingRatioShorts &&
            !isNaN(fundingRatios.fundingRatioShorts) && (
              <Grid item>
                <MouseOverPopOver
                  popOverText={<>Long funding rate/ Short funding rate</>}
                  textClassName={classes.fundingPopOver}
                >
                  <InfoColumn
                    label="Funding Rates"
                    value={`${roundToDecimal(
                      fundingRatios.fundingRatioLongs / 24,
                      6
                    )}%/${roundToDecimal(
                      fundingRatios.fundingRatioShorts / 24,
                      6
                    )}%`}
                  />
                </MouseOverPopOver>
              </Grid>
            )}
          <Grid item>
            <InfoColumn
              label="Next Funding"
              value={<Countdown date={fundingCountdown} />}
            />
          </Grid>
          <Grid item>
            <InfoColumn label="24h Volume" value={"$" + (volume || 0)} />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

const MarketInfo = () => {
  return (
    <FloatingCard>
      <MarketData />
    </FloatingCard>
  );
};

export default MarketInfo;
