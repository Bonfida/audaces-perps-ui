import { createMuiTheme } from "@material-ui/core/styles";

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "Rota",
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          backgroundColor: "rgb(13, 16, 23)",
        },
      },
    },
    MuiCardContent: {
      root: {
        "&:last-child": {
          paddingBottom: 0,
        },
      },
    },
    MuiInputBase: {
      input: {
        width: 150,
        fontSize: "36px",
      },
    },
    MuiTab: {
      textColorPrimary: {
        color: "#FFFFFF",
        "&$selected": {
          color: "#FFFFFF",
          fontWeight: 700,
        },
      },
    },
    MuiOutlinedInput: {
      notchedOutline: {
        borderWidth: "1px",
        borderColor: "#9BA3B5 !important",
      },
      input: {
        height: 20,
      },
    },
    MuiFormLabel: {
      root: {
        color: "white",
        "&$disabled": { color: "white" },
      },
    },
    MuiInput: {
      focused: {},
      disabled: {},
      error: {},
      underline: {
        "&:before": {
          borderBottom: "1px solid rgba(255, 255, 255, 0.4)",
        },
        "&:after": {
          borderBottom: "1px solid rgba(255, 255, 255, 0.4)",
        },
        "&:hover:not($disabled):not($focused):not($error):before": {
          borderBottom: "1px solid rgba(255, 255, 255, 0.8)",
        },
      },
    },
    MuiTableCell: {
      stickyHeader: {
        backgroundColor: "#141721",
      },
      root: {
        borderBottom: "0px",
      },
    },
    MuiTableRow: {
      root: {
        "&:last-child td": {
          borderBottom: 0,
        },
      },
    },
    MuiList: {
      root: {
        background: "rgb(18, 23, 31)",
        color: "white",
      },
    },
    MuiMenuItem: {
      root: {
        "&$selected": { background: "rgb(56, 60, 67)" },
      },
    },
    MuiPaper: {
      root: {
        background: "rgb(56, 60, 67)",
        backgroundColor: "rgb(56, 60, 67)",
      },
    },
  },
});
