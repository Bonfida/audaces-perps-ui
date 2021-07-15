import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";

const StyledLeverage = withStyles({
  root: {
    color: "#00ADB5",
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -8,
    marginLeft: -12,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)",
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

const LeverageSlider = ({
  value,
  onChange,
  valueLabelDisplay,
  max = 100,
  min = 1,
}) => {
  return (
    <StyledLeverage
      value={value}
      onChange={onChange}
      valueLabelDisplay={valueLabelDisplay}
      max={max}
      min={min}
    />
  );
};

export default LeverageSlider;
