import {
  Box,
  Button,
  Checkbox,
  Fab,
  FormControlLabel,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Fade } from "@mui/material";
import { useState } from "react";

interface JoinChoirProps {
  onContinue: () => void;
  onCancel: () => void;
  onCheckPermission: () => Promise<boolean>;
}

const JoinChoir = ({
  onContinue,
  onCancel,
  onCheckPermission,
}: JoinChoirProps) => {
  const [isConsentChecked, setIsConsentChecked] = useState(false);

  const handleContinue = async () => {
    const hasPermission = await onCheckPermission();
    if (!hasPermission) return;
    onContinue();
  };

  return (
    <Fade mountOnEnter unmountOnExit in={true}>
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          "& .MuiFab-root": { width: 250, height: 250 },
          mx: "auto",
        }}
        position={"absolute"}
        top={0}
        left={0}
        right={0}
        bottom={0}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Box sx={{ position: "relative" }}>
          <Skeleton
            variant="circular"
            animation="pulse"
            sx={{
              position: "absolute",
              width: 300,
              height: 300,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          <Fab size="large">
            <Stack alignItems="center" spacing={1}>
              <Typography variant="button">JOIN CHOIR</Typography>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
              >
                <Box sx={{ width: 20, height: 3, bgcolor: "primary.main" }} />
                <Box sx={{ width: 20, height: 3, bgcolor: "grey.500" }} />
                <Box sx={{ width: 20, height: 3, bgcolor: "grey.500" }} />
              </Stack>
              <Typography variant="body2">
                Rehearse your
                <br />
                singing to the loop
              </Typography>
            </Stack>
          </Fab>
        </Box>
        <Stack direction="row" alignItems="center" sx={{ mt: 4 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isConsentChecked}
                onChange={(e) => setIsConsentChecked(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                I consent to my recording being used solely for the artistic
                purposes of Invisible Choir
              </Typography>
            }
          />
        </Stack>
        <Button
          variant="contained"
          disabled={!isConsentChecked}
          sx={{ mt: 4 }}
          onClick={handleContinue}
        >
          Continue
        </Button>
        <Button variant="text" sx={{ mt: 3 }} onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Fade>
  );
};

export default JoinChoir;
