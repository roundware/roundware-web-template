import { Context, createContext, Dispatch, SetStateAction } from 'react';
import { ITag } from 'roundware-web-framework/dist/types';

export interface IDraftRecordingContext {
	tags: ITag[];
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
	setTags: Dispatch<SetStateAction<ITag[]>>;
	selectTag: (tag: ITag, deselect: ITag) => void;
	clearTags: (tags: ITag[]) => void;
	reset: () => void;
}
const DraftRecordingContext = createContext<IDraftRecordingContext>(undefined!);

export default DraftRecordingContext;
