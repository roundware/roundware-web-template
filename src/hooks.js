import { useContext } from "react";
import {RoundwareContext, DraftRecordingContext} from "./context";
import { useCookies } from "react-cookie";
import { nanoid } from "nanoid";
import {useLocation} from "react-router";

export const useRoundware = () => useContext(RoundwareContext);
export const useRoundwareDraft = () => useContext(DraftRecordingContext);

// A custom hook that builds on useLocation to parse
// the query string for you.
export const useQuery = () => {
  const location = useLocation();
  return new URLSearchParams(location.search);
}


export const useDeviceID = () => {
  const [cookies, setCookie] = useCookies(["deviceId"]);

  if (!cookies["deviceId"]) {
    const millisecondsYear = 365 * 24 * 60 * 60 * 1000;
    const expiry = new Date(Number(new Date()) + millisecondsYear);
    setCookie("deviceId", nanoid(), { expires: expiry });
  }
};
