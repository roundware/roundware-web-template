import { createContext } from 'react';

export interface IURLContext {
	params: URLSearchParams;
	addToURL: (name: string, value: string) => void;
	deleteFromURL: (name: string) => void;
}
export const URLContext = createContext<IURLContext>(undefined!);
