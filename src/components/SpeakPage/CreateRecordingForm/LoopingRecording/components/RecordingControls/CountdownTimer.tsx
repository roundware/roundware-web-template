import { Typography, keyframes } from "@mui/material";
import { useLoopContext } from "../../LoopContext";

const countdownAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  20% {
    opacity: 1;
    transform: translateY(0);
  }
  80% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(10px);
  }
`;

const CountdownTimer = () => {
  const { recorder } = useLoopContext();
  const count = parseInt(recorder.startingRecordingInSeconds.toFixed(0));

  return (
    <Typography
      variant="h3"
      sx={{
        animation: `${countdownAnimation} 1s ease-in-out infinite`,
        color: "white",
        fontWeight: "bold",
        display: "inline-block",
      }}
    >
      {count}
    </Typography>
  );
};

export default CountdownTimer;
