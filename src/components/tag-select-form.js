import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Checkbox from "@material-ui/core/Checkbox";
import React, {Fragment, useState} from "react";
import { useRoundware } from "../hooks";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const useStyles = makeStyles((theme) => {
  return {
    cardGrid: {
      width: "100%",
      direction: "column",
    },

    tagCard: {
      flex: 1,
      margin: theme.spacing(4),
      minWidth: "20rem",
      padding: theme.spacing(6),
    },
    selectedTagCard: {
      borderColor: "primary",
      borderWidth: "2px",
      borderStyle: "solid"
    }
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
  const toggleTagSelected = (tagId) => {
    const isSelected = draftRecording.tags.indexOf(tagId) !== -1;
    clearRecordingTags(choices.map((c) => c.id));
    selectRecordingTag(tagId, isSelected);
  }
  return (
    <div>
      <Container>
        <Typography variant="h1">{tagGroup.group_short_name}</Typography>
        <Typography variant="h2">{tagGroup.header_display_text}</Typography>
      </Container>
      <Grid container className={classes.cardGrid}>
          {choices.map((choice) => {
            const isSelected = draftRecording.tags.indexOf(choice.id) !== -1
            return (
              <Card
              key={choice.id}
              className={`${classes.tagCard} ${isSelected ? classes.selectedTagCard : ''}`}
              onClick={() => toggleTagSelected(choice.id)}>
                <FormControlLabel
                  checked={isSelected}
                  control={<Checkbox
                    style={{display: "none"}} size={"medium"}
                    onChange={evt=> {toggleTagSelected(choice.id)}}
                  />}
                  label={ choice.tag_display_text } />
              </Card>
            )
          })}

      </Grid>
      <Container>
      <Button disabled={!nextEnabled}
              variant={"contained"}
              color={"primary"}
              onClick={() => {
                // todo handle the dynamic trees that are possible with RW tag groups
                const isLastGroup = tagGroups.length <= tagGroupIndex + 1
                if ( isLastGroup ) {
                  setTaggingDone(true);
                } else {
                  setTagGroupIndex(tagGroupIndex + 1)
                }
              }}>Next</Button>
      </Container>
    </div>
  );
};
export default TagSelectForm;
