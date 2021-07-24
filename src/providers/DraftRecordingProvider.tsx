import DraftRecordingContext, { IDraftRecordingContext } from 'context/DraftRecordingContext';
import { useEffect, useState } from 'react';

export const DraftRecordingProvider = ({ roundware, children }) => {
	const [location, setLocation] = useState<IDraftRecordingContext[`location`]>({
		latitude: null,
		longitude: null,
	});
	const [tags, setTags] = useState<IDraftRecordingContext[`tags`]>([]);
	const [acceptedAgreement, setAcceptedAgreement] = useState<IDraftRecordingContext[`acceptedAgreement`]>(false);

	useEffect(() => {
		if (!roundware._project || !roundware._project.location) {
			return;
		}
		if (location.latitude === null || location.longitude === null) {
			setLocation(roundware._project.location);
		}
	}, [roundware._project && roundware._project.location]);

	const selectTag: IDraftRecordingContext[`selectTag`] = (tag, deselect) => {
		const newTags = [...tags];
		if (!deselect) {
			newTags.push(tag);
		} else {
			const tagPosition = newTags.indexOf(tag);
			if (tagPosition !== -1) {
				newTags.splice(tagPosition, 1);
			}
		}
		setTags(newTags);
	};

	const reset: IDraftRecordingContext[`reset`] = () => {
		setTags([]);
		setLocation({ latitude: null, longitude: null });
		setAcceptedAgreement(false);
	};

	const clearTags: IDraftRecordingContext[`clearTags`] = (tags) => {
		const newTags = [...tags];
		tags.forEach((tag) => {
			const tagPosition = newTags.indexOf(tag);
			if (tagPosition !== -1) {
				newTags.splice(tagPosition, 1);
			}
		});

		setTags(newTags);
	};

	return (
		<DraftRecordingContext.Provider
			value={{
				tags,
				acceptedAgreement,
				location,
				setLocation,
				setTags,
				selectTag,
				clearTags,
				reset,
			}}
		>
			{children}
		</DraftRecordingContext.Provider>
	);
};
