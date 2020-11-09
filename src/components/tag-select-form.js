import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Checkbox from "@material-ui/core/Checkbox";
import React, {Fragment, useState} from "react";
import { useRoundware } from "../hooks";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Button from "@material-ui/core/Button";

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

const TagSelectForm = ({tagGroups}) => {
  const classes = useStyles();
  const {
    roundware,
    setTaggingDone,
    selectRecordingTag,
    clearRecordingTags,
    draftRecording,
  } = useRoundware();
  const [tagGroupIndex, setTagGroupIndex] = useState(0);
  if (draftRecording.doneTagging) {
    return null;
  }
  const tagGroup = tagGroups[tagGroupIndex];
  const choices = tagGroup.display_items;
  let nextEnabled = false;
  if (tagGroup.select === 'single') {
    nextEnabled = choices.some(tag => draftRecording.tags.includes(tag.id))
  }
  return (
    <Fragment>
      <Container>
        <Typography variant="h1">{tagGroup.group_short_name}</Typography>
        <Typography variant="h2">{tagGroup.header_display_text}</Typography>
      </Container>
      {JSON.stringify(tagGroup)}
      <Grid container className={classes.cardGrid}>
        <fieldset>
          {choices.map((choice) => (
            <Grid container item xs={11} key={choice.id}>
              <Card className={classes.tagCard}>
                <Grid container>
                  <Grid item xs={10}>
                    <Typography variant={"h4"}>
                      {choice.tag_display_text}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Checkbox
                      checked={draftRecording.tags.indexOf(choice.id) !== -1}
                      onChange={(e) => {
                        clearRecordingTags(choices.map((choice) => choice.id));
                        selectRecordingTag(choice.id, !e.target.checked);
                      }}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </fieldset>
      </Grid>
      <Button disabled={!nextEnabled} onClick={() => {
        // todo handle the dynamic trees that are possible with RW tag groups
        const isLastGroup = tagGroups.length <= tagGroupIndex + 1
        if ( isLastGroup ) {
          setTaggingDone(true);
        } else {
          setTagGroupIndex(tagGroupIndex + 1)
        }
      }}>Next</Button>
    </Fragment>
  );
};
export default TagSelectForm;
