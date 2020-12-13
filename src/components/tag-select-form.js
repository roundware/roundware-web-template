import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Checkbox from "@material-ui/core/Checkbox";
import React from "react";
import {useRoundware, useRoundwareDraft} from "../hooks";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { CardContent } from "@material-ui/core";
import {generatePath, useHistory} from "react-router-dom";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      flexGrow: 1,
    },
    cardGrid: {
    },
    tagCard: {
      margin: theme.spacing(1),
      padding: theme.spacing(4),
      cursor: "pointer",
    },
    tagGroupHeader: {
      marginBottom: theme.spacing(3)
    },
    selectedTagCard: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  };
});
const later = (delay, value) =>
  new Promise(resolve => setTimeout(resolve, delay, value));

const TagSelectForm = ({match}) => {
  const classes = useStyles();
  const { roundware } = useRoundware();
  const draftRecording = useRoundwareDraft();
  const history = useHistory();
  // wait for roundware to be initialized
  if (!roundware.uiConfig || !roundware.uiConfig.speak) {
    return null;
  }
  // figure out which tagGroup to show in this view
  let tagGroupIndex = 0;
  if (match.params.tagGroupIndex) {
    tagGroupIndex = parseInt(match.params.tagGroupIndex);
  }
  const tagGroups = roundware.uiConfig.speak;
  const tagGroup = tagGroups[tagGroupIndex];

  // display the choices for this tagGroup that have no parent specified,
  // or have their parent selected in the draft recording already
  const choices = tagGroup.display_items.filter((item) => {
    return (
      item.parent_id === null ||
      draftRecording.tags.indexOf(item.parent_id) !== -1
    );
  });

  const toggleTagSelected = (tagId) => {
    const isSelected = draftRecording.tags.indexOf(tagId) !== -1;
    draftRecording.clearTags(choices.map((c) => c.id));
    draftRecording.selectTag(tagId, isSelected);
    // let the ui respond to the selection before navigating
    later(500, ).then(
      () => {
        const isLastGroup = tagGroups.length <= tagGroupIndex + 1;
        if (isLastGroup) {
          history.push('/speak/location');
        } else {
          const nextUrl = generatePath(match.path, {tagGroupIndex: tagGroupIndex + 1})
          history.push(nextUrl);
        }
      }
    )

  };
  return (
    <div className={classes.root}>
      <Card className={classes.tagGroupHeader}>
        <CardContent>
          <Typography variant={"h4"}>{tagGroup.header_display_text}</Typography>
        </CardContent>
      </Card>
      <Grid container direction={"column"} className={classes.cardGrid}>
        {choices.map((choice) => {
          const isSelected = draftRecording.tags.indexOf(choice.id) !== -1;
          return (
            <Card
              key={choice.id}
              className={`${classes.tagCard} ${
                isSelected ? classes.selectedTagCard : ""
              }`}
              onClick={() => toggleTagSelected(choice.id)}
            >
              <FormControlLabel
                checked={isSelected}
                control={
                  <Checkbox
                    style={{ display: "none" }}
                    size={"medium"}
                    onChange={() => {
                      toggleTagSelected(choice.id);
                    }}
                  />
                }
                label={<Typography children={[choice.tag_display_text]}/>}
              />
            </Card>
          );
        })}
      </Grid>
      <Container>
        <Button
          style={{
            margin: "auto"
          }}
          variant={"contained"}
          onClick={() => {
            if (tagGroupIndex === 0) {
              history.replace("/")
            } else {
              const nextUrl = generatePath(match.path, {tagGroupIndex: tagGroupIndex - 1})
              history.replace(nextUrl);
            }
          }}
        >
          Back
        </Button>
      </Container>
    </div>
  );
};
export default TagSelectForm;
