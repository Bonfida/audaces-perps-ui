import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import getIcon from "../utils/icons";
import { Grid, Typography } from "@material-ui/core";
import FloatingCard from "./FloatingCard";
import { useOraclePrice } from "../utils/perpetuals";
import {
  useMarkPrice,
  useMarket,
  use24hVolume,
  useUserAccount,
  getFundingRate,
} from "../utils/market";
import { roundToDecimal, USDC_DECIMALS, useSmallScreen } from "../utils/utils";
import MouseOverPopOver from "./MouseOverPopOver";
import Countdown from "react-countdown";
import useInterval from "../utils/useInterval";

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
  const marketName = "BTC/USDC";
  const baseCurrency = "BTC";

  return (
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
      <Grid item>
        <Typography className={classes.marketName} align="center">
          {marketName}
        </Typography>
      </Grid>
    </Grid>
  );
};

const MarketData = () => {
  const classes = useStyles();
  const { marketState } = useMarket();
  const userAccount = useUserAccount();
  const [indexPrice] = useOraclePrice();
  const markPrice = useMarkPrice();
  const [volume] = use24hVolume();
  const fundingRatios = getFundingRate(marketState);
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
        <Grid
          container
          justify="space-around"
          alignItems="center"
          direction="row"
          spacing={5}
        >
          {!smallScreen && (
            <Grid item>
              <Header />
            </Grid>
          )}
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
