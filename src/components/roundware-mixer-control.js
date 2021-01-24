import React, {useEffect} from "react";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import SkipNextIcon from '@material-ui/icons/SkipNext';
import Button from "@material-ui/core/Button";
import {useRoundware} from "../hooks";
import { GeoListenMode } from "roundware-web-framework";

const RoundwareMixerControl = props => {
  const { roundware, forceUpdate } = useRoundware();
  useEffect(() => {
    // when the control for the mixer is unmounted, clean up by stopping the mixer
    return () => {
      if (roundware._mixer &&  roundware._mixer.active) {
        roundware._mixer.toggle(roundware._mixer.token)
        roundware._mixer.stop();
      }
  }}, [])

  return (
    <>
      <Button
        onClick={() => {
          if (!roundware._mixer) {
            roundware
              .activateMixer({ geoListenMode: GeoListenMode.MANUAL })
              .then((token, force) => {
                const listen_tags = roundware.uiConfig.listen[0].display_items.map(
                  (i) => i.tag_id
                );
                roundware._mixer.updateParams({
                  listenerLocation: roundware._listenerLocation,
                  minDist: 0,
                  maxDist: 0,
                  recordingRadius: 0,
                  listenTagIds: listen_tags,
                });
                roundware._mixer.toggle(token, force);
                forceUpdate();
              });
          } else {
            roundware._mixer.toggle(roundware._mixer.token, false);
            forceUpdate();
          }
        }}
      >
        {roundware && roundware._mixer && roundware._mixer.playing ? (
          <PauseCircleOutlineIcon fontSize="large" />
        ) : (
          <PlayCircleOutlineIcon fontSize="large" />
        )}
      </Button>
      <Button
        onClick={() => {
          if (!roundware._mixer) {

          } else {
            roundware._mixer.skipTrack(7);
          }
        }}
      >
        <SkipNextIcon />
      </Button>
    </>
  );
};

export default RoundwareMixerControl;
