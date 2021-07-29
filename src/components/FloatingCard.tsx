import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: "#202430",
    padding: 10,
    borderRadius: "4px 4px 0px 0px",
    height: "100%",
  },
}));

const FloatingCard = ({ children }) => {
  const classes = useStyles();
  return (
    <Box height="100%">
      <div className={classes.root}>{children}</div>
    </Box>
  );
};

export default FloatingCard;
