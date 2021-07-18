import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderColor: "#8BC6EC",
    border: "1px solid",
    padding: 10,
    borderRadius: 10,
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
