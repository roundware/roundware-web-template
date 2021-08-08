import { ITag } from 'roundware-web-framework/dist/types';

// all the reusable types here
export interface ITagLookup {
	[id: number]: ITag;
}
export interface ISelectedTags {
	[group_key: string]: number[]; // tag_ids
}
