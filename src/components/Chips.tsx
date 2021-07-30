import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Chip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSmallScreen } from "../utils/utils";

const useStyles = makeStyles({
  leverageWarning: {
    height: 34,
    width: 312,
    marginLeft: 10,
    padding: 10,
    marginBottom: 3,
  },
  leverageRisk: {
    marginTop: 10,
  },
  leverageValue: {
    background: "#0F0F11",
    borderRadius: 10,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 800,
    height: 19,
    width: "100%",
    margin: 1,
    textAlign: "center",
    alignItems: "center",
    paddingBottom: 5,
  },
  leverageValueContainer: {
    background: "linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)",
    borderRadius: 10,
    height: 21,
    width: 50,
    justifyContent: "center",
    display: "flex",
  },
});

// Leverage chips

export const LongChip = withStyles({
  root: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 2,
    border: "1px solid",
    fontWeight: 600,
    fontSize: 14,
    color: "#02C77A",
    borderColor: "#02C77A",
    marginBottom: 3,
  },
  // @ts-ignore
})(Chip);

export const ShortChip = withStyles({
  root: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 2,
    border: "1px solid",
    fontWeight: 600,
    fontSize: 14,
    color: "#FF3B69",
    borderColor: "#FF3B69",
    marginBottom: 3,
  },
  // @ts-ignore
})(Chip);

const LeverageChip = ({
  side,
  leverage,
}: {
  side: string;
  leverage: string;
}) => {
  switch (side) {
    case "short":
      return <ShortChip variant="outlined" label={`${leverage}x`} />;
    default:
      return <LongChip variant="outlined" label={`${leverage}x`} />;
  }
};

export default LeverageChip;

// Information Chip (c.f TradeForm)

export const InformationChip = withStyles({
  root: {
    padding: 15,
    borderRadius: 4,
    border: "2px solid",
    fontWeight: 600,
    fontSize: 16,
    color: "rgb(56, 164, 252)",
    borderColor: "rgb(56, 164, 252)",
  },
  // @ts-ignore
})(Chip);

export const IsolatedPositionChip = () => {
  const smallScreen = useSmallScreen();
  return (
    <ShortChip
      variant="outlined"
      label={
        <Grid
          container
          justify="space-around"
          alignItems="center"
          spacing={smallScreen ? undefined : 3}
        >
          <Grid item>Positions are isolated</Grid>
          <Grid item>
            <InfoIcon style={{ fontSize: 18, marginTop: 4 }} />
          </Grid>
        </Grid>
      }
    />
  );
};

export const DecreaseLeverageChip = () => {
  const classes = useStyles();
  return (
    <InformationChip
      className={classes.leverageWarning}
      variant="outlined"
      label={
        <Grid container justify="space-around" alignItems="center" spacing={3}>
          <Grid item>This will decrease your leverage</Grid>
          <Grid item>
            <InfoIcon style={{ fontSize: 18, marginTop: 4 }} />
          </Grid>
        </Grid>
      }
    />
  );
};

export const IncreaseLeverageChip = () => {
  const classes = useStyles();
  return (
    <ShortChip
      className={classes.leverageWarning}
      variant="outlined"
      label={
        <Grid container justify="space-around" alignItems="center" spacing={3}>
          <Grid item>This will increase your leverage</Grid>
          <Grid item>
            <InfoIcon style={{ fontSize: 18, marginTop: 4 }} />
          </Grid>
        </Grid>
      }
    />
  );
};

export const LiquidatedChip = () => {
  const classes = useStyles();
  return (
    <ShortChip
      className={classes.leverageWarning}
      variant="outlined"
      label={
        <Grid container justify="space-around" alignItems="center" spacing={3}>
          <Grid item>Liquidated</Grid>
          <Grid item>
            <InfoIcon style={{ fontSize: 18, marginTop: 4 }} />
          </Grid>
        </Grid>
      }
    />
  );
};

export const LeverageValueChip = ({ value }: { value: number }) => {
  const classes = useStyles();
  return (
    <div className={classes.leverageValueContainer}>
      <div className={classes.leverageValue}>{value}x</div>
    </div>
  );
};
