import React from "react";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({});

const TradeSettingsTopBar = () => {
  const classes = useStyles();
  return (
    <Grid container alignItems="center" justify="center">
      <Grid item>Selector</Grid>
      <Grid item>Layout settings</Grid>
    </Grid>
  );
};

export default TradeSettingsTopBar;
