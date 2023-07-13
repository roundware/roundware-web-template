import DraftRecordingContext, { IDraftRecordingContext } from '../context/DraftRecordingContext';
import React, { useEffect, useState } from 'react';
import { Roundware } from 'roundware-web-framework';
import { IUserResponse } from 'roundware-web-framework/dist/types/user';

interface DraftRecordingProviderProps {
	roundware: Roundware;
	children: React.ReactNode;
}
export const DraftRecordingProvider = ({ roundware, children }: DraftRecordingProviderProps) => {
	const [location, setLocation] = useState<IDraftRecordingContext[`location`]>({
		latitude: null,
		longitude: null,
	});
	const [tags, setTags] = useState<IDraftRecordingContext[`tags`]>([]);
	const [acceptedAgreement, setAcceptedAgreement] = useState<IDraftRecordingContext[`acceptedAgreement`]>(false);

	const [user, setUser] = useState<Partial<IUserResponse>>();

	useEffect(() => {
		if (!roundware.project || !roundware.project.location) {
			return;
		}
		if (location.latitude === null || location.longitude === null) {
			const projectLocation = roundware.project.location;

			setLocation({
				latitude: +(projectLocation?.latitude || 0),
				longitude: +(projectLocation?.longitude || 0),
			});
		}
	}, [roundware.project && roundware.project.location]);

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
		const projectLocation = roundware.project.location;

		setLocation({
			latitude: +(projectLocation?.latitude || 0),
			longitude: +(projectLocation?.longitude || 0),
		});
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
				setUser,
				user,
			}}
		>
			{children}
		</DraftRecordingContext.Provider>
	);
};
