
import React, {Fragment, useEffect, useState} from "react";
import { useRoundware } from "../hooks";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Button from "@material-ui/core/Button";
import MediaRecorder from "audio-recorder-polyfill";
import mpegEncoder from "audio-recorder-polyfill/mpeg-encoder";
import Typography from "@material-ui/core/Typography";
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.js';
import Container from "@material-ui/core/Container";
import AudioSpectrum from "react-audio-spectrum";
import Grid from "@material-ui/core/Grid";
import { IconButton } from '@material-ui/core';
import Icon from "@material-ui/core/Icon";
import MicIcon from '@material-ui/icons/Mic';
import Wave from "@foobar404/wave";
import Dialog from "@material-ui/core/Dialog";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import ButtonGroup from "@material-ui/core/ButtonGroup";

const useStyles = makeStyles((theme) => {

});

const visualizerOptions = {
  type: 'bars'
}

const CreateRecordingForm = ({tagGroups}) => {
  const classes = useStyles();
  const {
    roundware,
    setTaggingDone,
    draftRecording,
  } = useRoundware();
  let [wave, set_wave] = useState(new Wave());
  const [isRecording, set_is_recording] = useState(false);
  const [draftRecordingMedia, set_draft_recording_media] = useState();
  const [draftMediaUrl, set_draft_media_url] = useState("");
  const [recorder, set_recorder] = useState();
  const [recordButtonProcessing, set_record_button_processing] = useState(false);
  const [stream, set_stream] = useState();
  const [deleteModalOpen, set_delete_modal_open] = useState(false);
  const [legalModalOpen, set_legal_modal_open] = useState(false);

  const startRecording = () => {
    set_record_button_processing(true);
    navigator.mediaDevices.getUserMedia({ audio: true }).then(
      stream => {
        set_draft_recording_media(null);
        set_stream(stream);
        wave.stopStream()
        const newWave = new Wave();
        set_wave(newWave);
        newWave.fromStream(stream, 'audio-visualizer', visualizerOptions, false);
        const recorder = new MediaRecorder(stream);
        set_recorder(recorder);
        // Set record to <audio> when recording will be finished
        recorder.addEventListener('dataavailable', e => {
          console.log('data available: ' + e.data.size);
          set_draft_recording_media(e.data);
        })
        recorder.start();
        set_is_recording(true);
        set_record_button_processing(false);
      })
  }

  useEffect(() => {
    const mediaUrl = draftRecordingMedia ? URL.createObjectURL(draftRecordingMedia) : null
    set_draft_media_url(mediaUrl)
  }, [draftRecordingMedia])

  useEffect(() => {
    if (draftMediaUrl != null) {
      wave.fromElement("draft-audio", "audio-visualizer", visualizerOptions);
    }
  }, [draftMediaUrl])

  const stopRecording = () => {
    set_record_button_processing(true);
    recorder.stop();
    stream.getTracks().forEach(track => {
      track.stop()
    })
    wave.stopStream()
    // set_stream(null);
    set_is_recording(false);
    set_record_button_processing(false);
  }

  const deleteRecording = () => {
    set_draft_recording_media(null);
  }
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <Grid container alignItems={"center"} direction={"column"} className={"visualizer-canvas"}>
      <Typography> { isRecording.toString() } </Typography>
      <Grid item xs={9}>
        <canvas id="audio-visualizer" />
      </Grid>

      { draftMediaUrl ? <Grid item><audio id={"draft-audio"} src={draftMediaUrl} controls /></Grid> : null}
      <Grid item>
        <IconButton
          disabled={draftMediaUrl != null}
          style={{
            margin: "auto",
            backgroundColor: isRecording ? "red" : "inherit",
          }}
          variant="contained"
          onClick={toggleRecording}
          label={isRecording ? "stop" : "start"}
        >
          <MicIcon
            color={isRecording ? "primary" : "inherit" }
          />
        </IconButton>
      </Grid>
      <Grid container item xs={10} sm={6}>
      <Button
        style={{margin:"auto"}}
        variant="contained"
        color="secondary"
        onClick={() => {set_delete_modal_open(true)}}>Delete</Button>

      <Dialog open={deleteModalOpen}>
        <Container>
          <Typography>Delete your current draft recording?</Typography>
        </Container>
        <Grid container>
          <Grid item>
            <Button
            variant="contained"
            color="primary"
            onClick={()=>{
              set_delete_modal_open(false);
            }}
          >No, keep it!</Button>
          </Grid>
          <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={()=>{
              deleteRecording();
              set_delete_modal_open(false);
            }}
          >Yes, delete it!</Button>
          </Grid>
        </Grid>
      </Dialog>
      <Button variant="contained" color="primary"
              style={{margin:"auto"}}

              onClick={() => {set_legal_modal_open(true)}}>Share</Button>
        <Dialog open={legalModalOpen}>
          <Container>
            <Typography variant={"h2"}>Content Agreement</Typography>
            <Typography>{roundware._project.legalAgreement}</Typography>
          </Container>
          <Grid container>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                onClick={()=>{
                  set_legal_modal_open(false);
                }}
              >I disagree</Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={()=>{
                  set_legal_modal_open(false);
                }}
              >I agree!</Button>
            </Grid>
          </Grid>
        </Dialog>
      </Grid>
    </Grid>
  );
};
export default CreateRecordingForm;
