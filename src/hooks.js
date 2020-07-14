import {useContext} from "react";
import RoundwareContext from "./context";
import {useCookies} from "react-cookie";
import {nanoid} from "nanoid";

export const useRoundware = () => useContext(RoundwareContext)

export const useDeviceID = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['deviceId']);
  removeCookie("deviceId");

  if (!cookies['deviceId']) {
    const millisecondsYear = 365 * 24 * 60 * 60 * 1000;
    const expiry = new Date(Number(new Date()) + millisecondsYear);
    setCookie("deviceId", nanoid(), { expires: expiry });
  }
}