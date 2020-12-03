import Toolbar from "@material-ui/core/Toolbar";
import React from "react";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import Button from "@material-ui/core/Button";

const RoundwareMixerControl = props => {
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