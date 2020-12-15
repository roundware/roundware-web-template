import React, {useEffect} from "react";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import Button from "@material-ui/core/Button";
import {useRoundware} from "../hooks";

const RoundwareMixerControl = props => {
  const {roundware} = useRoundware();
  // if the control for the mixer is unmounted, clean up by stopping the mixer
  useEffect(() => {
    return () => {
      if (roundware._mixer &&  roundware._mixer.active) {
        roundware._mixer.toggle(roundware._mixer.token)
        roundware._mixer.stop();
      }
  }}, [])
  return (
    <Button
    onClick={() => {
      if (!roundware._mixer) {
        roundware.activateMixer().then((token, force) => {
          roundware._mixer.toggle(token, force);
        });
      } else {
        roundware._mixer.toggle(roundware._mixer.token, false);
      }
    }}
  >
    {roundware && roundware._mixer && roundware._mixer.playing ? (
      <PauseCircleOutlineIcon />
    ) : (
      <PlayCircleOutlineIcon />
    )}
  </Button>
  )
}

export default RoundwareMixerControl;