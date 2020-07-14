import {useContext} from "react";
import RoundwareContext from "./context";
import {useCookies} from "react-cookie";
import {nanoid} from "nanoid";

export const useRoundware = () => useContext(RoundwareContext)

export const useDeviceID = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['deviceId']);
  if (!cookies['deviceId']) {
    setCookie("deviceId", nanoid(), { expires: 365 });
  }
}