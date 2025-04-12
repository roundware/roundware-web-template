import ConfirmationDialog from "@/components/elements/ConfirmationDialog";
import { Close, Logout } from "@mui/icons-material";
import ReplayIcon from "@mui/icons-material/Replay";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import { useHistory } from "react-router";
import JoinChoir from "./components/JoinChoir";
import RecordingControls from "./components/RecordingControls";
import SubmissionControls from "./components/SubmissionControls";
import { useLoopContext, withLoopContext } from "./LoopContext";

const LoopingRecordingForm = () => {
  const { recorder, submission } = useLoopContext();
  const [showJoinChoirPage, setShowJoinChoirPage] = useState(true);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showRerecordConfirm, setShowRerecordConfirm] = useState(false);

  const history = useHistory();

  return (
    <Box
      sx={{
        overflow: "hidden",
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {showJoinChoirPage ? (
        <JoinChoir
          onContinue={() => {
            setShowJoinChoirPage(false);
          }}
          onCancel={() => {
            history.push("/listen");
          }}
          onCheckPermission={recorder.checkMicrophonePermission}
        />
      ) : (
        <RecordingControls />
      )}

      <SubmissionControls
        hasRecording={!!recorder.recordedAudioBlob}
        submissionStatus={submission.status}
        onLegalAccept={async () => {
          await submission.start();
        }}
        onLegalDecline={() => {}}
      />

      <ConfirmationDialog
        open={showRerecordConfirm}
        onClose={() => setShowRerecordConfirm(false)}
        onConfirm={() => {
          setShowRerecordConfirm(false);
          recorder.scheduleRecording();
        }}
        icon={<ReplayIcon sx={{ fontSize: 40 }} />}
        title="Re-record"
        description="Are you sure? You will lose your recording."
        confirmText="Yes, Re-record"
        cancelText="Cancel"
      />

      <ConfirmationDialog
        open={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={() => {
          setShowCloseConfirm(false);
          history.push("/listen");
        }}
        icon={<Logout sx={{ fontSize: 40 }} />}
        title="Leave Choir"
        description="Are you sure you want to leave this choir? You will lose your recording."
        confirmText="Yes, Leave"
        cancelText="Cancel"
      />

      <ConfirmationDialog
        open={submission.status === "submitted"}
        onClose={() => {
          history.push("/listen");
        }}
        onConfirm={() => {
          history.push("/listen");
        }}
        icon={<Logout sx={{ fontSize: 40 }} />}
        title="Thank You!"
        description="Your voice has been added to the choir and can now be heard with the other voices in this location."
        confirmText="Listen"
        cancelText=""
      />

      {!showJoinChoirPage && (
        <Button
          variant="outlined"
          size="small"
          sx={{
            position: "absolute",
            top: 80,
            right: 16,
            minWidth: 0,
            p: 1,
            borderRadius: "50%",
          }}
          onClick={() => setShowCloseConfirm(true)}
        >
          <Close />
        </Button>
      )}
    </Box>
  );
};

export default withLoopContext(LoopingRecordingForm);
