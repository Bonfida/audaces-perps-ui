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
          background:
            "linear-gradient(90deg, rgba(18,23,33,1) 0%, rgba(19,30,48,1) 50%, rgba(18,23,33,1) 100%)",
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
      underline: {
        borderBottom: "2px solid #00ADB5",
      },
    },
    MuiTableCell: {
      stickyHeader: {
        backgroundColor: "#141721",
      },
      root: {
        borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
      },
    },
  },
});
