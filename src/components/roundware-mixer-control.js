import React, { useEffect } from "react";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import Button from "@material-ui/core/Button";
import { GeoListenMode } from "roundware-web-framework";
import { useRoundware } from "../hooks";

const RoundwareMixerControl = (props) => {
  const { roundware, forceUpdate } = useRoundware();
  useEffect(() => {
    // when the control for the mixer is unmounted, clean up by stopping the mixer
    return () => {
      if (roundware._mixer && roundware._mixer.active) {
        roundware._mixer.toggle(roundware._mixer.token);
        roundware._mixer.stop();
      }
    };
  }, []);

  return (
    <Button
      onClick={() => {
        if (!roundware._mixer) {
          roundware
            .activateMixer({ geoListenMode: GeoListenMode.DISABLED })
            .then((token, force) => {
              const listen_tags = roundware.uiConfig.listen[0].display_items.map(
                (i) => i.tag_id
              );
              roundware._mixer.updateParams({
                listenerLocation: roundware._listenerLocation,
                minDist: 0,
                maxDist: roundware._project.recordingRadius,
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
        <PauseCircleOutlineIcon />
      ) : (
        <PlayCircleOutlineIcon />
      )}
    </Button>
  );
};

export default RoundwareMixerControl;
