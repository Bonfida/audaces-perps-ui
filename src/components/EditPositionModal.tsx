import React from "react";
import Modal from "./Modal";
import { Typography, Grid, Tabs, Tab, AppBar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CompleteCloseDialog, PartialCloseDialog } from "./CloseDialog";
import AddCollateralDialog from "./AddCollateralDialog";
import RemoveCollateralDialog from "./RemoveCollateralDialog";
import IncreasePositionDialog from "./IncreasePositionDialog";
import { Position } from "@audaces/perps";
import { IncreaseLeverageChip, DecreaseLeverageChip } from "./Chips";
import { Divider } from "@material-ui/core";
import TabPanel from "./TabPanel";

const useStyles = makeStyles({
  indicatorAddRemove: {
    backgroundColor: "#8BC6EC",
  },
  indicator: {
    backgroundColor: "transparent",
  },
  modalTitle: {
    color: "white",
    opacity: 0.8,
    fontSize: 24,
    marginBottom: 10,
  },
  selectButton: {
    color: "white",
    width: 150,
    borderRadius: 15,
    fontSize: 18,
  },
  selectButtonActive: {
    color: "white",
    backgroundColor: "#8BC6EC",
    width: 150,
    borderRadius: 15,
    fontSize: 18,
    "&:hover": {
      color: "white",
      backgroundColor: "#8BC6EC",
    },
  },
  selectButtonContainer: {
    border: "1px solid",
    borderColor: "#8BC6EC",
    borderRadius: 20,
    width: 302,
    marginTop: 10,
    marginBottom: 10,
  },
  modalContainer: {
    height: "30vh",
    minHeight: 550,
    minWidth: 500,
    // margin: 10,
  },
  divider: {
    background: "#8BC6EC",
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
  },
  AppBar: {
    background: "transparent",
    paddingTop: 0,
  },
  flexContainer: {
    justifyContent: "space-between",
  },
  tab: {
    color: "#77E3EF",
    fontSize: 14,
    fontWeight: 800,
    textTransform: "capitalize",
  },
});

const EditPositionModal = ({
  openModal,
  setOpen,
  position,
  selectedButton,
  setSelectedButton,
}: {
  openModal: boolean;
  setOpen: (arg: boolean) => void;
  position: Position;
  selectedButton: string;
  setSelectedButton: (arg: string) => void;
}) => {
  const classes = useStyles();
  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Modal openModal={openModal} setOpen={setOpen} noPadding={true}>
      <div className={classes.modalContainer}>
        <AppBar className={classes.AppBar} position="static" elevation={0}>
          <Tabs
            variant="standard"
            value={selectedButton}
            onChange={() => {
              selectedButton === "collateral"
                ? setSelectedButton("size")
                : setSelectedButton("collateral");
            }}
            classes={{
              flexContainer: classes.flexContainer,
              indicator: classes.indicator,
            }}
          >
            <Tab
              label="Size"
              className={classes.tab}
              style={{
                background:
                  selectedButton === "collateral" ? "#141722" : "transparent",
                width: "50%",
                borderRadius:
                  selectedButton === "size" ? "4px 4px 0px 0px" : "undefined",
              }}
            />
            <Tab
              label="Collateral"
              className={classes.tab}
              style={{
                background:
                  selectedButton === "size" ? "#141722" : "transparent",
                width: "50%",
                borderRadius:
                  selectedButton === "collateral"
                    ? "4px 4px 0px 0px"
                    : "undefined",
              }}
            />
          </Tabs>
        </AppBar>
        {selectedButton === "size" && (
          <>
            <Tabs
              value={tab}
              indicatorColor="primary"
              textColor="primary"
              onChange={handleTabChange}
              centered
              classes={{ indicator: classes.indicatorAddRemove }}
            >
              <Tab disableRipple label="Decrease" />
              <Tab disableRipple label="Increase" />
            </Tabs>
            {/* Reduce Position */}
            <TabPanel value={tab} index={0}>
              <PartialCloseDialog position={position} />
              <Divider classes={{ root: classes.divider }} />
              <Typography className={classes.modalTitle} align="center">
                Complete Close?
              </Typography>
              <CompleteCloseDialog position={position} />
            </TabPanel>
            {/* Increase Position */}
            <TabPanel value={tab} index={1}>
              <IncreasePositionDialog position={position} />
            </TabPanel>
          </>
        )}
        {selectedButton === "collateral" && (
          <>
            <Tabs
              value={tab}
              indicatorColor="primary"
              textColor="primary"
              onChange={handleTabChange}
              centered
              classes={{ indicator: classes.indicatorAddRemove }}
            >
              <Tab disableRipple label="Add" />
              <Tab disableRipple label="Remove" />
            </Tabs>
            {/* Add Collateral */}
            <TabPanel value={tab} index={0}>
              <AddCollateralDialog position={position} />
            </TabPanel>
            {/* Remove Collateral */}
            <TabPanel value={tab} index={1}>
              <RemoveCollateralDialog position={position} />
            </TabPanel>
          </>
        )}

        <Grid container justify="center">
          {tab === 0 && (
            <>
              <DecreaseLeverageChip />
            </>
          )}
          {tab === 1 && (
            <>
              <IncreaseLeverageChip />
            </>
          )}
        </Grid>
      </div>
    </Modal>
  );
};

export default EditPositionModal;
