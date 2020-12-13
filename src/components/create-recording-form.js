import React, { useEffect, useState } from "react";
import {useRoundware, useRoundwareDraft} from "../hooks";
import Button from "@material-ui/core/Button";
import MediaRecorder from "audio-recorder-polyfill";
import Grid from "@material-ui/core/Grid";
import { IconButton } from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import Wave from "@foobar404/wave";
import LegalAgreementForm from "./legal-agreement-form";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import ErrorDialog from "./error-dialog";
import Dialog from "@material-ui/core/Dialog";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CircularProgress from "@material-ui/core/CircularProgress";

const visualizerOptions = {
  type: "bars",
};

const CreateRecordingForm = () => {
  const draftRecording = useRoundwareDraft();
  const { roundware } = useRoundware();
  let [wave, set_wave] = useState(new Wave());
  const [isRecording, set_is_recording] = useState(false);
  const [draftRecordingMedia, set_draft_recording_media] = useState();
  const [draftMediaUrl, set_draft_media_url] = useState("");
  const [recorder, set_recorder] = useState();
  const [stream, set_stream] = useState();
  const [deleteModalOpen, set_delete_modal_open] = useState(false);
  const [legalModalOpen, set_legal_modal_open] = useState(false);
  const [saving, set_saving] = useState(false);
  const [error, set_error] = useState(null);
  const [success, set_success] = useState(false);

  const startRecording = () => {
    if (!navigator.mediaDevices) {
      set_error({message: "we can't get access to your microphone at this time"})
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      set_draft_recording_media(null);
      set_stream(stream);
      wave.stopStream();
      const newWave = new Wave();
      set_wave(newWave);
      newWave.fromStream(stream, "audio-visualizer", visualizerOptions, false);
      const recorder = new MediaRecorder(stream);
      set_recorder(recorder);
      // Set record to <audio> when recording will be finished
      recorder.addEventListener("dataavailable", (e) => {
        console.log("data available: " + e.data.size);
        set_draft_recording_media(e.data);
      });
      recorder.start();
      set_is_recording(true);
    }).catch(err => {
      set_error(err)
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
    wave.stopStream();
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
  // todo present the participant with the tags they picked
  // const selected_tags = draftRecording.tags && draftRecording.tags.map(tag => tagLookup[draftRecording.tags]);

  return (
    <Grid
      container
      alignItems={"center"}
      direction={"column"}
      className={"visualizer-canvas"}
    >
      <ErrorDialog error={error} set_error={set_error}/>
      <Grid item xs={9}>
        <canvas id="audio-visualizer" />
      </Grid>

      {draftMediaUrl ? (
        <Grid item>
          <audio id={"draft-audio"} src={draftMediaUrl} controls />
        </Grid>
      ) : null}
      <Grid item>
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
          <MicIcon color={isRecording ? "primary" : "inherit"} />
        </IconButton>
      </Grid>
      <Grid container item>
        <Button
          style={{ margin: "auto" }}
          variant="contained"
          color="secondary"
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
        <Button
          variant="contained"
          color="primary"
          style={{ margin: "auto" }}
          disabled={draftMediaUrl === ""}
          onClick={() => {
            set_legal_modal_open(true);
          }}
        >
          Share
        </Button>
        <Dialog open={legalModalOpen}>
          <LegalAgreementForm
            onDecline={() => {
              set_legal_modal_open(false);
            }}
            onAccept={() => {
              set_legal_modal_open(false);
              set_saving(true);
              const fileName = new Date().toISOString() + ".mp3";
              const assetMeta = {
                longitude: draftRecording.location.longitude,
                latitude: draftRecording.location.latitude,
                tag_ids: draftRecording.tags,
              };
              roundware
                .saveAsset(draftRecordingMedia, fileName, assetMeta)
                .then((asset) => {
                  set_success(asset);
                }).catch(err => {
                  set_error({"message": err});
                }).finally(() => {
                  set_saving(false);
              })
            }}
          />
        </Dialog>
      </Grid>
      <Dialog open={saving}>
        <DialogContent>
          <CircularProgress color={"primary"} style={{margin: "auto"}}/>
          <DialogContentText>
            Uploading your recording now! Please keep this page open until we
            finish uploading
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <Dialog open={success}>
        <DialogContent>
          <DialogContentText style={{textAlign: "center"}}>
            <CheckCircleIcon color={"primary"}/>
          </DialogContentText>
          <DialogContentText>
            Upload Complete!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant={"contained"}
                  color={"primary"}
                  onClick={()=>{
                    set_success(null);
                  }}
          >OK</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};
export default CreateRecordingForm;
