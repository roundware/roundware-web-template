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

const TagSelectForm = () => {
  const classes = useStyles();
  const {
    roundware,
    setTaggingDone,
    selectRecordingTag,
    clearRecordingTags,
    draftRecording,
  } = useRoundware();

  const [tagGroupIndex, setTagGroupIndex] = useState(0);

  if (!roundware.uiConfig) {
    return null
  }
  const tagGroups = roundware.uiConfig.speak

  const tagGroup = tagGroups[tagGroupIndex];
  const choices = tagGroup.display_items.filter(item => {
    // display the choices for this tagGroup that have no parent specified,
    // or have their parent selected in the draft recording already
    return item.parent_id === null || draftRecording.tags.indexOf(item.parent_id) !== -1
  });
  let nextEnabled = false;
  if (tagGroup.select === 'single') {
    nextEnabled = choices.some(tag => draftRecording.tags.includes(tag.id))
  }
  return (
    <Grid>
      <Container>
        <Typography variant="h1">{tagGroup.group_short_name}</Typography>
        <Typography variant="h2">{tagGroup.header_display_text}</Typography>
        <Typography variant="h4">{draftRecording.tags}</Typography>
      </Container>
      <Grid container className={classes.cardGrid}>
          {choices.map((choice) => (
            <Grid container item xs={11}
                  key={choice.id}
                  style={{
                    border: draftRecording.tags.indexOf(choice.id) !== -1 ? "primary" : "inherit"
                  }}
                  onClick={ () => {
                    const isSelected = draftRecording.tags.indexOf(choice.id) !== -1;
                    clearRecordingTags(choices.map((c) => c.id));
                    selectRecordingTag(choice.id, isSelected);
                  }}
            >
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
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
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
    </Grid>
  );
};
export default TagSelectForm;
