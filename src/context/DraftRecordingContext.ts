import { Context, createContext, Dispatch, SetStateAction } from 'react';

export interface IDraftRecordingContext {
	tags: any[];
	acceptedAgreement: boolean;
	location: {
		latitude: any;
		longitude: any;
	};
	setLocation: Dispatch<
		SetStateAction<{
			latitude: any;
			longitude: any;
		}>
	>;
	setTags: Dispatch<SetStateAction<any[]>>;
	selectTag: (tag: any, deselect: any) => void;
	clearTags: (tags: any[]) => void;
	reset: Function;
}
const DraftRecordingContext: Context<Partial<IDraftRecordingContext>> = createContext({});

export default DraftRecordingContext;
