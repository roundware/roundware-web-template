import React, { CSSProperties } from 'react';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';
import { useRoundware } from '../hooks';
interface AssetPlayerProps {
	asset: IAssetData;
	style?: CSSProperties;
	className?: string;
	captureEvents?: boolean;
}

const AssetPlayer = ({ asset, style, className }: AssetPlayerProps) => {
	if (!asset) {
		return null;
	}

	let ext = /(?:\.([^.]+))?$/.exec(asset.file!)![1];
	// replace extension with no3;
	let filename = asset.file!.replace(ext, 'mp3');
	const supported = ['mp3', 'wav'];
	if (supported.indexOf(ext) === -1) {
		ext = 'mp3';
		let lastPos = filename.indexOf('.', filename.length - 5);
		let pos = lastPos == -1 ? filename.length : lastPos;
		filename = filename.substr(0, pos < 0 ? filename.length : pos) + '.' + ext;
	}

	const { roundware, forceUpdate } = useRoundware();
	const handlePlay = () => {
		roundware.events?.logAssetStart(asset.id);
		roundware.listenHistory.addAsset(asset);
		forceUpdate();
	};
	const handleEnd = () => {
		roundware.events?.logAssetEnd(asset.id);
	};
	return (
		<audio controls style={style} preload='none' controlsList='nodownload' className={className} onPlay={handlePlay} onPause={handleEnd} onEnded={handleEnd}>
			<source src={filename} />
			Your browser does not support audio!
		</audio>
	);
};

export default AssetPlayer;
