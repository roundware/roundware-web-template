import { Context, createContext, Dispatch, SetStateAction } from 'react';
import { ITag } from 'roundware-web-framework/dist/types';

export interface IDraftRecordingContext {
	tags: number[];
	acceptedAgreement: boolean;
	location: {
		latitude: number | null;
		longitude: number | null;
	};
	setLocation: Dispatch<
		SetStateAction<{
			latitude: number | null;
			longitude: number | null;
		}>
	>;
	setTags: Dispatch<SetStateAction<number[]>>;
	selectTag: (tag: number, deselect?: boolean) => void;
	clearTags: (tags: number[]) => void;
	reset: () => void;
}
const DraftRecordingContext = createContext<IDraftRecordingContext>(undefined!);

export default DraftRecordingContext;
