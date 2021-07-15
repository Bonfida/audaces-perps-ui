import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Chip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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
  return (
    <ShortChip
      variant="outlined"
      label={
        <Grid container justify="space-around" alignItems="center" spacing={3}>
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
