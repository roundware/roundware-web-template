import PermissionDeniedDialog from "@/components/elements/PermissionDeniedDialog";
import { Box, Stack } from "@mui/material";
import { Prompt } from "react-router-dom";
import { useLoopContext } from "../../LoopContext";
import StepIndicator from "../StepIndicator";
import { memo } from "react";
import AnimatedCircle from "./AnimatedCircle";
import ControlButton from "./ControlButton";
import { useDimensions } from "./hooks";

const RecordingControls = () => {
  const { loop, recorder, submission, speaker } = useLoopContext();
  const dimensions = useDimensions();

  if (!speaker.duration) return null;

  return (
    <Stack spacing={8} height={"100%"}>
      <Box pt={28}>
        <StepIndicator />
      </Box>
      <Box
        position={"absolute"}
        sx={{
          top: "calc(50% - 100px)",
          transform: "translateY(-50%)",
        }}
      >
        <Box
          position="relative"
          width={dimensions.svgSize}
          height={dimensions.svgSize}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box zIndex={2}>
            <AnimatedCircle
              dimensions={dimensions}
              mode={loop.mode}
              startedAtTime={loop.startedAtTime}
              duration={speaker.duration}
            />
          </Box>
          <ControlButton
            mode={loop.mode}
            onPlayClick={() => loop.start("playing-speaker")}
            onRecordClick={recorder.scheduleRecording}
          />
        </Box>
      </Box>
      <Box />
      <PermissionDeniedDialog
        open={recorder.isPermissionDenied}
        onClose={() => recorder.setIsPermissionDenied(false)}
        functionality="microphone"
      />
      <Prompt
        when={!!recorder.recordedAudioBlob && submission.status === "submitted"}
        message={JSON.stringify({
          message: `Are you sure you want to leave without submitting your recording? If you do, your recording will be deleted.`,
          stay: `Keep Recording`,
          leave: `Delete Recording`,
        })}
      />
    </Stack>
  );
};

export default memo(RecordingControls);
