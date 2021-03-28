import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import React, { useEffect, useState } from "react";
import { useRoundware, useRoundwareDraft } from "../hooks";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Button from "@material-ui/core/Button";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Card, CardContent, CardActions } from "@material-ui/core";
import { generatePath, useHistory } from "react-router-dom";
import { wait } from "../utils";

const useStyles = makeStyles((theme) => {
  return {
    container: {
      flexGrow: 1,
      margin: "auto",
    },
    cardGrid: {
      marginBottom: theme.spacing(1),
    },
    tagCard: {
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginLeft: theme.spacing(3),
      marginRight: theme.spacing(3),
      padding: theme.spacing(4),
      cursor: "pointer",
      backgroundColor: theme.palette.grey[700],
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3),
      },
      [theme.breakpoints.down('xs')]: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        padding: theme.spacing(2, 1, 2, 3),
      },
    },
    tagGroupHeader: {
      marginBottom: theme.spacing(3),
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      backgroundColor: "transparent",
      boxShadow: "none",
      [theme.breakpoints.down('sm')]: {
        marginBottom: theme.spacing(0),
      },
      [theme.breakpoints.down('xs')]: {
        marginRight: theme.spacing(0),
        marginLeft: theme.spacing(0),
      },
    },
    tagGroupHeaderLabel: {
      fontSize: "2rem",
      [theme.breakpoints.only('sm')]: {
        fontSize: "1.5rem",
      },
      [theme.breakpoints.down('xs')]: {
        fontSize: "1.2rem",
      },
    },
    selectedTagCard: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  };
});

const TagSelectForm = ({match}) => {
  const classes = useStyles();
  const { roundware } = useRoundware();
  const draftRecording = useRoundwareDraft();
  const history = useHistory();

  // figure out which tagGroup to show in this view
  let tagGroupIndex = 0;
  if (match.params.tagGroupIndex) {
    tagGroupIndex = parseInt(match.params.tagGroupIndex);
  }
  const tagGroups = roundware.uiConfig && roundware.uiConfig.speak || {};
  const tagGroup = tagGroups[tagGroupIndex] || {display_items: []};

  const choices = tagGroup.display_items.filter((item) => {
      return (
        item.parent_id === null ||
        draftRecording.tags.indexOf(item.parent_id) !== -1
      );
  });


  useEffect( () => {
    // make sure we're thinking about a loaded framework
    if (!roundware.uiConfig || !roundware.uiConfig.speak) {
      return;
    }
    if (choices.length === 0) {
      const previousIndex = match.params.tagGroupIndex - 1
      if (previousIndex >= 0) {
        const previousUrl = match.path.replace(":tagGroupIndex", previousIndex)
        history.replace(previousUrl);
        return;
      }
    }
    }
  , [choices, roundware.uiConfig])
  const toggleTagSelected = (tagId) => {
    const isSelected = draftRecording.tags.indexOf(tagId) !== -1;
    let newTags;
    if (isSelected) {
      newTags = draftRecording.tags.filter( t => t !== tagId)
    } else {
      // other tags in this set of choices should be unselected
      const choiceIds = choices.map(c => c.id)
      newTags = draftRecording.tags.filter( t => choiceIds.indexOf(t) === -1)
      newTags = [...newTags, tagId]
    }
    draftRecording.setTags(newTags);
    // let the ui respond to the selection before navigating
    wait(500 ).then(
      () => {
        if (isSelected) {return}
        const isLastGroup = tagGroups.length <= tagGroupIndex + 1;
        window.scrollTo(0,0)
        if (isLastGroup) {
          history.push('/speak/location');
        } else {
          const nextUrl = generatePath(match.path, {tagGroupIndex: tagGroupIndex + 1})
          history.push(nextUrl);
        }
      }
    )
  };

  if (choices.length === 0) {
    return null
  };
  return (
    <Card className={classes.container}>
      <Card className={classes.tagGroupHeader}>
        <CardContent>
          <Typography
            variant={"h4"}
            className={classes.tagGroupHeaderLabel}
          >
            {tagGroup.header_display_text}
          </Typography>
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
              onClick={(e) => {
                toggleTagSelected(choice.id)
                e.preventDefault()
              }}
            >
              <FormControlLabel
                checked={isSelected}
                control={
                  <Checkbox
                    style={{ display: "none" }}
                    size={"medium"}
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
            margin: "0 auto 16px auto"
          }}
          variant={"contained"}
          startIcon={<ArrowBackIosIcon />}
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
    </Card>
  );
};
export default TagSelectForm;
