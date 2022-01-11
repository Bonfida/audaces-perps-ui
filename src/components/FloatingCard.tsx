import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: "rgb(18, 23, 31)",
    padding: 10,
    borderRadius: "4px 4px 0px 0px",
    height: "100%",
  },
}));

const FloatingCard = ({
  children,
  padding,
}: {
  children: React.ReactNode;
  padding?: string;
}) => {
  const classes = useStyles();
  return (
    <div
      className={classes.root}
      style={{ padding: padding ? padding : "undefined" }}
    >
      {children}
    </div>
  );
};

export default FloatingCard;
