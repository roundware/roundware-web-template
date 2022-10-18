import { ITag } from 'roundware-web-framework/dist/types';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';

// all the reusable types here
export interface ITagLookup {
	[id: number]: ITag | undefined;
}
export interface ISelectedTags {
	[group_key: string]: number[]; // tag_ids
}

export interface IMatch {
	params: {
		tagGroupIndex?: string;
	};
	path: string;
}
export type IImageAsset = IAssetData;
export type ITextAsset = string;
