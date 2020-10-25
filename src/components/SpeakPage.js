import Grid from "@material-ui/core/Grid";
import React, { Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import { useRoundware } from "../hooks";
import Card from "@material-ui/core/Card";
import { useDefaultStyles } from "../styles";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { spacing } from "react-select/src/theme";
import { useTheme } from "@material-ui/styles";
import Container from "@material-ui/core/Container";
import Radio from "@material-ui/core/Radio";

const useStyles = makeStyles((theme) => {
  return {
    cardGrid: {
      fontSize: "3rem",
      width: "100%",
      overflowX: "scroll",
      direction: "row",
    },

    tagCard: {
      flex: 1,
      margin: theme.spacing(4),
      minWidth: "20rem",
      padding: theme.spacing(6),
    },
  };
});

export const SpeakPage = () => {

  const { roundware, selectRecordingTag, draftRecording } = useRoundware();
  const classes = useStyles();
  if (roundware === null || !roundware.uiConfig) {
    return null;
  }
  const speakTags = roundware.uiConfig.speak;
  const firstTag = speakTags[0];
  return (
    <Fragment>
      <Container>
        <Typography variant="h1">{firstTag.group_short_name}</Typography>
        <Typography variant="h2">{firstTag.header_display_text}</Typography>
      </Container>
      <Grid container className={classes.cardGrid}>
        <fieldset>
          {firstTag.display_items.map((choice) => (
          <Grid container item xs={11} key={choice.id}>
            <Card className={classes.tagCard}>
              <Grid container>
                <Grid item xs={10}>
                  <Typography variant={"h4"}>
                    {choice.tag_display_text}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Radio
                    checked={draftRecording.tags.indexOf(choice.id) !== -1}
                    onChange={(e) => {
                      selectRecordingTag(choice.id, !e.target.checked)
                    }}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}
        </fieldset>
      </Grid>
    </Fragment>
  );
};
