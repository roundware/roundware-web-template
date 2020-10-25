import makeStyles from "@material-ui/core/styles/makeStyles";
import deepPurple from "@material-ui/core/colors/deepPurple";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";

export const defaultTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: deepPurple,
  },
});

export const lightTheme = createMuiTheme({
  palette: {
    type: "light",
    primary: deepPurple,
  },
});

export const useDefaultStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    display: "flex",
  },
}));
