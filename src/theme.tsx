import { createMuiTheme } from "@material-ui/core/styles";

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          backgroundColor: "#121838",
          background:
            "linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 61.99%)",
          transform: "transform: matrix(-1, 0, 0, 1, 0, 0)",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
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
      },
    },
    MuiInput: {
      underline: {},
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
  },
});
