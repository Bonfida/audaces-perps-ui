import React, { useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import gear from "../assets/components/Settings/gear2.svg";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { useLayout } from "../utils/layout";
import { Button } from "@material-ui/core";
import { useMarket } from "../utils/market";
import { nanoid } from "nanoid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 150,
      margin: 10,
      width: 280,
    },
    button: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
    },
    item: {
      color: "white",
      fontSize: 12,
    },
    slippageButton: {
      color: "white",
      border: "1px solid",
      borderColor: "#00ADB5",
      width: 5,
      borderRadius: 15,
    },
    slippageButtonSelected: {
      color: "white",
      border: "1px solid",
      borderColor: "#00ADB5",
      backgroundColor: "#00ADB5",
      width: 5,
      borderRadius: 15,
      fontSize: 12,
      "&:hover": {
        color: "white",
        borderColor: "#00ADB5",
        backgroundColor: "#00ADB5",
      },
    },
    onOffButton: {
      color: "white",
      width: 5,
      borderRadius: 15,
      fontSize: 12,
    },
    onOffButtonActive: {
      color: "white",
      backgroundColor: "#00ADB5",
      width: 5,
      borderRadius: 15,
      fontSize: 12,
      "&:hover": {
        color: "white",
        backgroundColor: "#00ADB5",
      },
    },
    onOffButtonContainer: {
      border: "1px solid",
      borderColor: "#00ADB5",
      borderRadius: 15,
      width: 130,
      marginTop: 10,
      marginBottom: 10,
    },
    toggleLabel: {
      color: "white",
      fontWeight: 600,
      fontSize: 12,
    },
    slippageTolerance: {
      marginBottom: 10,
      marginTop: 10,
      fontSize: 12,
    },
  })
);

const ToggleButton = ({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: (args: any) => void;
}) => {
  const classes = useStyles();
  return (
    <Grid container justify="space-between" alignItems="center" spacing={2}>
      <Grid item>
        <Typography className={classes.toggleLabel}>{label}</Typography>
      </Grid>
      <Grid item>
        <div className={classes.onOffButtonContainer}>
          <Button
            disableRipple={true}
            className={on ? classes.onOffButtonActive : classes.onOffButton}
            onClick={() => onClick(!on)}
          >
            On
          </Button>
          <Button
            disableRipple={true}
            className={!on ? classes.onOffButtonActive : classes.onOffButton}
            onClick={() => onClick(!on)}
          >
            Off
          </Button>
        </div>
      </Grid>
    </Grid>
  );
};

const Settings = (): JSX.Element => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { locked, setLocked, resetLayout } = useLayout();
  const { setAutoApprove, autoApprove } = useMarket();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <button onClick={handleClick} className={classes.button}>
        <img src={gear} height="40px" alt="" />
      </button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          style: {
            background: "rgb(39, 41,47)",
            borderRadius: 10,
            padding: 10,
          },
        }}
      >
        <div className={classes.root}>
          <Grid
            container
            justify="flex-start"
            alignItems="flex-start"
            direction="column"
          >
            <Grid item className={classes.item}>
              <ToggleButton
                key={nanoid()}
                on={autoApprove}
                onClick={setAutoApprove}
                label="Auto Approve Funding"
              />
              <ToggleButton
                key={nanoid()}
                on={locked}
                onClick={setLocked}
                label="Lock Layout"
              />
              <Grid
                container
                alignItems="center"
                justify="space-between"
                spacing={2}
              >
                <Grid item>
                  <Typography className={classes.toggleLabel}>
                    Reset layout
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    onClick={resetLayout}
                    className={classes.slippageButtonSelected}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Popover>
    </div>
  );
};

export default Settings;
