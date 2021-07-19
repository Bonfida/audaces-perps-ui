import React, { useState, useEffect } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { useLayout } from "../utils/layout";
import { Button, IconButton } from "@material-ui/core";
import { useMarket } from "../utils/market";
import { nanoid } from "nanoid";
import { notify } from "../utils/notifications";
import { useWallet } from "../utils/wallet";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { useSmallScreen } from "../utils/utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 220,
      margin: 10,
      width: 280,
    },
    button: {
      color: "white",
      background: "transparent",
      width: "auto",
      borderRadius: 25,
      height: "50px",
      border: "2px solid",
      borderColor: "#8BC6EC",
      fontWeight: 600,
      padding: 20,
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
    resetButton: {
      color: "white",
      backgroundColor: "#8BC6EC",
      backgroundImage: "linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)",
      width: 5,
      borderRadius: 17,
      fontSize: 12,
      "&:hover": {
        color: "white",
        backgroundColor: "#8BC6EC",
        backgroundImage: "linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)",
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
      backgroundColor: "#8BC6EC",
      backgroundImage: "linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)",
      width: 5,
      borderRadius: 15,
      fontSize: 12,
      "&:hover": {
        color: "white",
        backgroundColor: "#8BC6EC",
        backgroundImage: "linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)",
      },
    },
    onOffButtonContainer: {
      border: "1px solid",
      borderColor: "#8BC6EC",
      borderRadius: 17,
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
  const { connected } = useWallet();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { locked, setLocked, resetLayout } = useLayout();
  const {
    setAutoApprove,
    autoApprove,
    useIsolatedPositions,
    setUseIsolatedPositions,
    userAccount,
  } = useMarket();
  const smallScreen = useSmallScreen();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeIsolatedPositions = () => {
    // If no userAccount
    if (!userAccount?.openPositions) {
      setUseIsolatedPositions(!useIsolatedPositions);
    }
    // If 0 or 1 position can use isolated positions
    else if (userAccount?.openPositions.length <= 1) {
      setUseIsolatedPositions(!useIsolatedPositions);
    }
    // If 1 < positions can only use isolated positions
    else if (useIsolatedPositions) {
      notify({
        message:
          "You need to have only 1 position open to turn off the isolated positions mode",
      });
    } else {
      setUseIsolatedPositions(!useIsolatedPositions);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (!connected || !userAccount) return;
    if (
      !!userAccount?.openPositions &&
      userAccount?.openPositions.length > 1 &&
      !useIsolatedPositions
    ) {
      setUseIsolatedPositions(true);
    }
  }, [connected, useIsolatedPositions, setUseIsolatedPositions, userAccount]);

  return (
    <div>
      <IconButton onClick={handleClick} className={classes.button}>
        <MoreHorizIcon style={{ fontSize: 20, color: "white" }} />
      </IconButton>
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
              {!smallScreen && (
                <Grid item>
                  <ToggleButton
                    key={nanoid()}
                    on={autoApprove}
                    onClick={setAutoApprove}
                    label="Auto Approve Funding"
                  />
                </Grid>
              )}
              <Grid item>
                <ToggleButton
                  key={nanoid()}
                  on={locked}
                  onClick={setLocked}
                  label="Lock Layout"
                />
              </Grid>
              <Grid item>
                <ToggleButton
                  key={nanoid()}
                  on={useIsolatedPositions}
                  onClick={handleChangeIsolatedPositions}
                  label="Isolated Positions"
                />
              </Grid>
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
                  <Button onClick={resetLayout} className={classes.resetButton}>
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
