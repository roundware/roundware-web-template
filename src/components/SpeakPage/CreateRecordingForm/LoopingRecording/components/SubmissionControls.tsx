import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  Stack,
} from "@mui/material";
import LegalAgreementForm from "@/components/LegalAgreementForm";
import { useState } from "react";

interface SubmissionControlsProps {
  hasRecording: boolean;
  submissionStatus: "idle" | "submitting" | "submitted" | "error";

  onLegalAccept: () => Promise<void>;
  onLegalDecline: () => void;
}

const SubmissionControls = ({
  hasRecording,
  submissionStatus,
  onLegalAccept,
  onLegalDecline,
}: SubmissionControlsProps) => {
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  if (!hasRecording) return null;

  return (
    <>
      <Stack
        spacing={10}
        alignItems={"center"}
        sx={{ position: "absolute", bottom: 150, width: "100%" }}
      >
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setLegalModalOpen(true);
            }}
            size="large"
            sx={{
              fontWeight: "bold",
            }}
          >
            Submit Recording
          </Button>
        </Box>
      </Stack>

      <Dialog open={legalModalOpen}>
        <LegalAgreementForm
          onDecline={() => {
            setLegalModalOpen(false);
            onLegalDecline();
          }}
          onAccept={async () => {
            setLegalModalOpen(false);
            await onLegalAccept();
          }}
        />
      </Dialog>

      <Dialog open={submissionStatus === "submitting"}>
        <DialogContent>
          <CircularProgress color={"primary"} style={{ margin: "auto" }} />
          <DialogContentText>
            Uploading your contribution now! Please keep this page open until we
            finish uploading.
          </DialogContentText>
        </DialogContent>
      </Dialog>

      <Dialog open={submissionStatus === "error"}>
        <DialogContent>
          <DialogContentText>
            We encountered an error while trying to upload your contribution.
            Please try again later.
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubmissionControls;
