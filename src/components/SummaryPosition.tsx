import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid, Divider } from "@material-ui/core";
import { roundToDecimal } from "../utils/utils";

const useStyles = makeStyles({
  value: {
    color: "white",
    fontSize: 15,
    opacity: 0.8,
  },
  label: {
    fontSize: 12,
    color: "white",
  },
  summary: {
    fontSize: 14,
    color: "white",
    fontWeight: 400,
  },
  divider: {
    background: "#00ADB5",
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
  },
});

export const InformationRow = ({
  value,
  label,
}: {
  value: any;
  label: string;
}) => {
  const classes = useStyles();
  return (
    <Grid container justify="space-between" alignItems="center" spacing={5}>
      <Grid item>
        <Typography align="left" variant="body1" className={classes.label}>
          {label}
        </Typography>
      </Grid>
      <Grid item>
        <Typography align="left" variant="body1" className={classes.label}>
          {value}
        </Typography>
      </Grid>
    </Grid>
  );
};

export const CustomDivier = () => {
  const classes = useStyles();
  return <Divider classes={{ root: classes.divider }} />;
};

export const UpdatedPosition = ({
  baseSize,
  leverage,
  collateral,
  slippage,
}: {
  baseSize: number | string | null | undefined;
  leverage: number | string | null | undefined;
  collateral: number | string | null | undefined;
  slippage?: number | undefined;
}) => {
  const classes = useStyles();
  if (!(baseSize && leverage && collateral)) {
    return null;
  }
  return (
    <>
      <Typography align="left" className={classes.summary}>
        Summary
      </Typography>
      <CustomDivier />
      <InformationRow value={baseSize} label="New base size" />
      <InformationRow value={leverage + "x"} label="New leverage" />
      <InformationRow value={collateral} label="Collateral" />
      {!!slippage && (
        <InformationRow
          value={`${roundToDecimal(slippage * 100, 2)}%`}
          label="Expected Slippage"
        />
      )}
    </>
  );
};
