import { useRoundware } from '../hooks';
import React from 'react';

interface TagDisplayProps {
	tagId: number;
}
export const TagDisplay = ({ tagId }: TagDisplayProps) => {
	const { roundware } = useRoundware();
	const description = roundware.findTagDescription(tagId, 'speak');
	if (description) {
		return (
			<>
				<span className='rw-tag'>{description}</span>
				<br />
			</>
		);
	} else {
		return null;
	}
};

export const TagsDisplay = ({ tagIds }: { tagIds: number[] }) => {
	return (
		<div className='rw-tags'>
			{tagIds.map((tagId: any) => (
				<React.Fragment key={tagId}>
					<TagDisplay tagId={tagId} />
				</React.Fragment>
			))}
		</div>
	);
};
