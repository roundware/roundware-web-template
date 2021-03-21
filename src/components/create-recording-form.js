import React, { useEffect, useState } from "react";
import { useRoundware, useRoundwareDraft } from "../hooks";
import Button from "@material-ui/core/Button";
import MediaRecorder from "audio-recorder-polyfill";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { IconButton, useMediaQuery } from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import DeleteIcon from "@material-ui/icons/Delete";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import PhotoIcon from "@material-ui/icons/Photo";
import Wave from "@foobar404/wave";
import LegalAgreementForm from "./legal-agreement-form";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import ErrorDialog from "./error-dialog";
import Dialog from "@material-ui/core/Dialog";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { useHistory } from "react-router-dom";
import AudioPlayer from "material-ui-audio-player";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import AdditionalMediaMenu from "./additional-media-menu";
import { wait } from "../utils";

const visualizerOptions = {
  type: "bars",
};

const useStyles = makeStyles((theme) => {
  return {
    iconButtonLabel: {
      display: "flex",
      flexDirection: "column",
    },
    iconButton: {
      height: 150,
      width: 150,
      [theme.breakpoints.down("xs")]: {
        height: 100,
        width: 100,
      },
    },
    iconButtonSmall: {
      height: 50,
      width: 50,
      [theme.breakpoints.down("xs")]: {
        height: 30,
        width: 30,
      },
    },
    audioVisualizer: {
      backgroundColor: "#333",
      padding: "0 !important",
      height: 150,
      width: 300,
      [theme.breakpoints.down("xs")]: {
        height: 150,
      },
      [theme.breakpoints.down(350)]: {
        height: 100,
      },
    },
    label: {
      paddingTop: 0,
    },
    tagGroupHeaderLabel: {
      marginTop: theme.spacing(2),
      fontSize: "2rem",
      [theme.breakpoints.down("sm")]: {
        fontSize: "1.2rem",
      },
    },
  };
});

const useStylesAudioPlayer = makeStyles((theme) => {
  return {
    root: {
      width: 700,
      [theme.breakpoints.down("sm")]: {
        width: 500,
      },
      [theme.breakpoints.down("xs")]: {
        width: "100vw",
      },
    },
    playIcon: {
      //color: '#f50057',
      height: 75,
      width: 75,
      "&:hover": {
        //color: '#ff4081'
      },
    },
    pauseIcon: {
      height: 75,
      width: 75,
    },
    replayIcon: {
      height: 75,
      width: 75,
    },
    progressTime: {
      fontSize: "2em",
    },
    mainSlider: {
      //color: '#3f51b5',
      "& .MuiSlider-rail": {
        //color: '#7986cb',
        marginTop: 4,
      },
      "& .MuiSlider-track": {
        //color: '#3f51b5',
        marginTop: 4,
      },
      "& .MuiSlider-thumb": {
        //color: '#303f9f'
        height: 20,
        width: 20,
      },
    },
  };
});

const CreateRecordingForm = () => {
  const draftRecording = useRoundwareDraft();
  const { roundware, tagLookup, updateAssets } = useRoundware();
  let [wave, set_wave] = useState(new Wave());
  const [isRecording, set_is_recording] = useState(false);
  const [draftRecordingMedia, set_draft_recording_media] = useState();
  const [draftMediaUrl, set_draft_media_url] = useState("");
  const [recorder, set_recorder] = useState();
  const [stream, set_stream] = useState();
  const [textAsset, setTextAsset] = useState(null);
  const [imageAsset, setImageAsset] = useState(null);
  const [deleteModalOpen, set_delete_modal_open] = useState(false);
  const [legalModalOpen, set_legal_modal_open] = useState(false);
  const [saving, set_saving] = useState(false);
  const [error, set_error] = useState(null);
  const [success, set_success] = useState(null);
  const history = useHistory();
  const classes = useStyles();
  const theme = useTheme();
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));

  const startRecording = () => {
    if (!navigator.mediaDevices) {
      set_error({
        message: "we can't get access to your microphone at this time",
      });
      return;
    } else {
      set_error(null);
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        set_draft_recording_media(null);
        set_stream(stream);
        wave.stopStream();
        const newWave = new Wave();
        set_wave(newWave);
        newWave.fromStream(
          stream,
          "audio-visualizer",
          visualizerOptions,
          false
        );
        const recorder = new MediaRecorder(stream);
        set_recorder(recorder);
        // Set record to <audio> when recording will be finished
        recorder.addEventListener("dataavailable", (e) => {
          console.log("data available: " + e.data.size);
          set_draft_recording_media(e.data);
        });
        recorder.start();
        set_is_recording(true);
      })
      .catch((err) => {
        set_error(err);
      });
  };

  useEffect(() => {
    const mediaUrl = draftRecordingMedia
      ? URL.createObjectURL(draftRecordingMedia)
      : "";
    set_draft_media_url(mediaUrl);
  }, [draftRecordingMedia]);

  useEffect(() => {
    if (draftMediaUrl !== "") {
      wave.fromElement("draft-audio", "audio-visualizer", visualizerOptions);
    }
  }, [draftMediaUrl]);

  const stopRecording = () => {
    recorder.stop();
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    wait(100).then(wave.stopStream);

    set_is_recording(false);
  };

  const deleteRecording = () => {
    set_draft_recording_media(null);
  };
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    const hasLocation =
      draftRecording.location.latitude && draftRecording.location.longitude;
    if (!hasLocation) {
      history.replace("/speak/location/");
    }
    const hasTags = draftRecording.tags.length > 0;

    if (!hasTags) {
      history.replace("/speak/tags/0");
    }
  }, [
    draftRecording.tags,
    draftRecording.location.latitude,
    draftRecording.location.longitude,
  ]);

  // todo present the participant with the tags they picked
  const selected_tags = draftRecording.tags.map((tag) => tagLookup[tag]);

  const maxRecordingLength = roundware._project
    ? roundware._project.maxRecordingLength
    : "--";

  return (
    <div style={{ overflowX: "hidden" }}>
      <Grid container alignItems={"center"} direction={"column"} spacing={8}>
        <Grid item>
          <Container>
            {/*{ selected_tags.map( tag => <Typography variant={"h6"}key={tag.id}>{tag.tag_display_text}</Typography> ) }*/}
            {
              <Typography
                variant={"h5"}
                className={classes.tagGroupHeaderLabel}
                key={
                  selected_tags.length > 0
                    ? selected_tags[selected_tags.length - 1].id
                    : 1
                }
              >
                {selected_tags.length > 0
                  ? selected_tags[selected_tags.length - 1].tag_display_text
                  : "No selected tags"}
              </Typography>
            }
          </Container>
        </Grid>
        <ErrorDialog error={error} set_error={set_error} />
        <Grid item xs={12} className={classes.audioVisualizer}>
          <canvas id="audio-visualizer" />
        </Grid>

        {draftMediaUrl ? (
          <Grid item>
            {/*}<audio id={"draft-audio"} src={draftMediaUrl} controls />*/}
            <AudioPlayer
              id="draft-audio"
              src={draftMediaUrl}
              useStyles={useStylesAudioPlayer}
              variation="primary"
              time="single"
              timePosition="end"
              volume={false}
            />
          </Grid>
        ) : null}
        {!draftMediaUrl && !isRecording ? (
          <Grid item style={{ paddingBottom: 0 }}>
            <IconButton
              disabled={draftMediaUrl !== ""}
              style={{
                margin: "auto",
                backgroundColor: isRecording ? "red" : "inherit",
              }}
              variant="contained"
              onClick={toggleRecording}
              label={isRecording ? "stop" : "start"}
            >
              <MicIcon
                color={isRecording ? "primary" : "inherit"}
                className={classes.iconButton}
              />
            </IconButton>
          </Grid>
        ) : null}
        {/*}<Grid
          item
          style={{"paddingTop": 0}}>
          <Typography
            variant={"h3"}
            className={classes.label}>
            {draftMediaUrl ? "Listen Back" : (isRecording ? "Recording!" : "Record")}
          </Typography>
        </Grid>*/}
        {isRecording ? (
          <Grid item>
            <CountdownCircleTimer
              isPlaying
              duration={maxRecordingLength}
              size={isExtraSmallScreen ? 140 : 180}
              strokeWidth={isExtraSmallScreen ? 8 : 12}
              onComplete={() => {
                stopRecording();
              }}
              colors={[
                ["#004777", 0.33],
                ["#F7B801", 0.33],
                ["#A30000", 0.33],
              ]}
            >
              {({ remainingTime }) => (
                <Grid container direction="column" alignItems="center">
                  <Grid item>
                    <Typography variant="h3" style={{ textAlign: "center" }}>
                      {Math.floor(remainingTime / 60) +
                        ":" +
                        (remainingTime % 60).toLocaleString("en-US", {
                          minimumIntegerDigits: 2,
                          useGrouping: false,
                        })}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      disabled={draftMediaUrl !== ""}
                      style={{
                        margin: "auto",
                        backgroundColor: isRecording ? "red" : "inherit",
                        justifyContent: "center",
                      }}
                      variant="contained"
                      onClick={toggleRecording}
                      label={isRecording ? "stop" : "start"}
                    >
                      <MicIcon
                        color={isRecording ? "primary" : "inherit"}
                        className={classes.iconButtonSmall}
                      />
                    </IconButton>
                  </Grid>
                </Grid>
              )}
            </CountdownCircleTimer>
          </Grid>
        ) : null}
        <Grid container item>
          <Button
            style={{ margin: "auto" }}
            variant="contained"
            color="secondary"
            size={isExtraSmallScreen ? "small" : "medium"}
            startIcon={<DeleteIcon />}
            disabled={draftMediaUrl === ""}
            onClick={() => {
              set_delete_modal_open(true);
            }}
          >
            Delete
          </Button>

          <Dialog open={deleteModalOpen}>
            <DialogContent>
              <DialogContentText>
                Delete your current draft recording?
              </DialogContentText>
            </DialogContent>

            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  set_delete_modal_open(false);
                }}
              >
                No, keep it!
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  deleteRecording();
                  set_delete_modal_open(false);
                }}
              >
                Yes, delete it!
              </Button>
            </DialogActions>
          </Dialog>
          <AdditionalMediaMenu
            onSetText={setTextAsset}
            onSetImage={setImageAsset}
          />
          <Button
            variant="contained"
            color="primary"
            size={isExtraSmallScreen ? "small" : "medium"}
            startIcon={<CloudUploadIcon />}
            style={{ margin: "auto" }}
            disabled={draftMediaUrl === ""}
            onClick={() => {
              set_legal_modal_open(true);
            }}
          >
            Submit
          </Button>
          <Dialog open={legalModalOpen}>
            <LegalAgreementForm
              onDecline={() => {
                set_legal_modal_open(false);
              }}
              onAccept={async () => {
                set_legal_modal_open(false);
                set_saving(true);
                const assetMeta = {
                  longitude: draftRecording.location.longitude,
                  latitude: draftRecording.location.latitude,
                  tag_ids: selected_tags.map((t) => t.tag_id),
                };
                const dateStr = new Date().toISOString();

                // Make an envelope to hold the uploaded assets.
                const envelope = await roundware.makeEnvelope();
                try {
                  // Add the audio asset.
                  const asset = await envelope.upload(
                    draftRecordingMedia,
                    dateStr + ".mp3",
                    assetMeta
                  );

                  // Add the text asset, if any.
                  if (textAsset) {
                    await envelope.upload(
                      new Blob([textAsset], { type: "text/plain" }),
                      dateStr + ".txt",
                      { ...assetMeta, media_type: "text" }
                    );
                  }
                  if (imageAsset) {
                    await envelope.upload(
                      imageAsset,
                      imageAsset.name || dateStr + ".jpg",
                      {
                        ...assetMeta,
                        media_type: "photo",
                      }
                    );
                  }
                  set_success(asset);
                  updateAssets();
                } catch (err) {
                  set_error({ message: err });
                }
                set_saving(false);
              }}
            />
          </Dialog>
        </Grid>
        <Dialog open={saving}>
          <DialogContent>
            <CircularProgress color={"primary"} style={{ margin: "auto" }} />
            <DialogContentText>
              Uploading your recording now! Please keep this page open until we
              finish uploading
            </DialogContentText>
          </DialogContent>
        </Dialog>
        <Dialog open={success !== null}>
          <DialogContent>
            <DialogContentText style={{ textAlign: "center" }}>
              <CheckCircleIcon color={"primary"} />
            </DialogContentText>
            <DialogContentText>
              Upload Complete! Thank you for participating!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={() => {
                history.push(`/listen?eid=${success.envelope_ids[0]}`);
              }}
            >
              Listen
            </Button>
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={() => {
                draftRecording.reset();
                history.push("/speak");
              }}
            >
              Create New Recording
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </div>
  );
};
export default CreateRecordingForm;
