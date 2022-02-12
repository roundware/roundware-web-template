import { createContext, useContext } from 'react';

export interface IURLContext {
	params: URLSearchParams;
	addToURL: (name: string, value: string) => void;
	deleteFromURL: (name: string | string[]) => void;
}
export const URLContext = createContext<IURLContext>(undefined!);
export const useURLSync = () => useContext(URLContext);
