import { MicOutlined, PlayCircleFilled, Replay } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { memo, useState } from "react";
import { useLoopingRecording } from "../../useLoopingRecording";
import { useLoopContext } from "../../LoopContext";
import CountdownTimer from "./CountdownTimer";

interface ControlButtonProps {
  mode: ReturnType<typeof useLoopingRecording>["loop"]["mode"];
  onPlayClick: () => void;
  onRecordClick: () => void;
}

const ControlButton = memo(
  ({ mode, onPlayClick, onRecordClick }: ControlButtonProps) => {
    const theme = useTheme();
    const { recorder } = useLoopContext();
    const [rerecordWarningOpen, setRerecordWarningOpen] = useState(false);

    return (
      <Box
        position={"absolute"}
        sx={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 3,
        }}
      >
        {mode === "idle" ? (
          <IconButton size="large" onClick={onPlayClick}>
            <PlayCircleFilled
              sx={{
                fontSize: 60,
                color: theme.palette.common.white,
              }}
            />
          </IconButton>
        ) : mode === "playing-speaker" ? (
          <IconButton onClick={onRecordClick}>
            <MicOutlined
              sx={{
                fontSize: 60,
                color: theme.palette.common.white,
              }}
            />
          </IconButton>
        ) : mode === "recording" ? (
          <Box
            width={60}
            height={60}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
            }}
          >
            <MicOutlined
              sx={{
                fontSize: 40,
                color: "rgba(255, 255, 255, 0.8)",
              }}
            />
          </Box>
        ) : mode === "recording-playback" ? (
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<Replay />}
            onClick={() => {
              setRerecordWarningOpen(true);
            }}
          >
            Re-Record
          </Button>
        ) : mode === "waiting-to-record" ? (
          <CountdownTimer />
        ) : mode === "loading" ? (
          <Typography variant="h3">Loading...</Typography>
        ) : null}

        <Dialog
          open={rerecordWarningOpen}
          onClose={() => setRerecordWarningOpen(false)}
        >
          <DialogTitle>Rerecord Warning</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to rerecord? This will delete the current
              recording and start over.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRerecordWarningOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setRerecordWarningOpen(false);
                onRecordClick();
              }}
            >
              Rerecord
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
);

export default ControlButton;
