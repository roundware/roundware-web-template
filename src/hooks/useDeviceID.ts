import { useCookies } from 'react-cookie';
import { nanoid } from 'nanoid';
export const useDeviceID = (): string => {
	const [cookies, setCookie] = useCookies(['deviceId']);

	if (!cookies['deviceId']) {
		const millisecondsYear = 365 * 24 * 60 * 60 * 1000;
		const expiry = new Date(Number(new Date()) + millisecondsYear);
		setCookie('deviceId', nanoid(), { expires: expiry });
	}

	return cookies[`deviceId`];
};
