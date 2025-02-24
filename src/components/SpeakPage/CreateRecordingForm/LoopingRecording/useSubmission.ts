import { Feature, multiPolygon, Polygon } from '@turf/helpers';
import { circle, buffer } from '@turf/turf';
import finalConfig from '@/config';
import { useRoundware, useRoundwareDraft } from '@/hooks/index';
import moment from 'moment';
import { useState } from 'react';
import { useHistory } from 'react-router';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';
import { ITag } from 'roundware-web-framework/dist/types/index';
import { ISpeakerData } from 'roundware-web-framework/dist/types/speaker';

// hook to handle saving of the recording to server
export const useSubmission = ({ location, recordedAudioBlob, baseSpeakers }: { location: { lat: number; lng: number }; recordedAudioBlob: Blob | null; baseSpeakers: ISpeakerData[] }) => {
	const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');

	const draftRecording = useRoundwareDraft();
	const { tagLookup, roundware } = useRoundware();
	const history = useHistory();

	async function start() {
		if (!recordedAudioBlob) {
			return;
		}
		// stop the audio

		setStatus('submitting');

		if (!finalConfig.speak.uploadAsSpeaker) {
			// upload as ASSET:

			const selected_tags = draftRecording.tags.map((tag) => tagLookup[tag]).filter((tag) => tag !== undefined);
			// include default speak tags
			const finalTags = selected_tags.map((t) => t?.tag_id).filter((t) => t !== undefined) as number[];
			finalConfig.speak.defaultSpeakTags?.forEach((t) => {
				if (!finalTags.includes(t)) {
					finalTags.push(t);
				}
			});

			const tags = await roundware.apiClient.get<ITag[]>('/tags', {
				project_id: roundware.project.projectId,
			});

			// @ts-ignore
			const speakerTag = tags.find((t) => t.value == selectedSpeakerId.current?.toString())?.id as number;

			if (speakerTag) {
				finalTags.push(speakerTag);
			}

			const assetMeta = {
				longitude: location.lng,
				latitude: location.lat,
				...(finalTags.length > 0 ? { tag_ids: finalTags } : {}),
			};
			const dateStr = new Date().toISOString();

			// Make an envelope to hold the uploaded assets.
			const envelope = await roundware.makeEnvelope();
			try {
				let asset: Partial<IAssetData> | null = null;
				// hold all promises for parallel execution
				const promises = [];
				// Add the audio asset.

				promises.push(
					(async () => {
						asset = await envelope.upload(recordedAudioBlob, dateStr + '.mp3', assetMeta);
					})()
				);
				await Promise.all(promises);
				setStatus('submitted');
				history.push(`/listen?eid=${envelope._envelopeId}`);
			} catch (err) {
				setStatus('error');
			}
		} else {
			const speakerShape = multiPolygon([
				circle([location.lng, location.lat], 10, {
					units: 'meters',
				}).geometry.coordinates,
			]);

			const formData = new FormData();
			formData.append('activeyn', 'true');
			formData.append('code', moment().format('DDMMYYHHmm'));
			formData.append('maxvolume', '1.0');
			formData.append('minvolume', '0.0');
			formData.append('shape', JSON.stringify(speakerShape.geometry));

			formData.append('file', recordedAudioBlob);
			formData.append('attenuation_distance', '5');
			formData.append('project_id', finalConfig.project.id.toString());
			if (baseSpeakers.length > 0) {
				formData.append('parents', baseSpeakers.map((s) => s.id).join(','));
			}

			const response: { id: string } = await roundware.apiClient.post('/speakers/', formData, {
				method: 'POST',
				contentType: 'multipart/form-data',
			});

			console.error('Response: ' + JSON.stringify(response, null, 2));

			try {
				if (response && baseSpeakers.length > 0) {
					await Promise.all(
						baseSpeakers.map(async (s) => {
							if (!s.shape) return;
							// Ensure closestSpeaker.shape is defined and valid
							const expandedShape = buffer(s.shape, 10, { units: 'meters' }) as Feature<Polygon>;

							if (expandedShape) {
								// Patch the closest speaker's shape
								const patchResponse = await roundware.apiClient.patch(`/speakers/${s.id}/`, {
									shape: multiPolygon([expandedShape.geometry.coordinates]).geometry,
								});

								console.error('Patch response:', patchResponse);
								console.error('Closest speaker shape updated successfully');
							} else {
								console.error('Failed to expand closestSpeaker shape');
							}
						})
					);
				} else {
					console.error('Invalid response or closestSpeaker data');
				}
			} catch (error) {
				console.error('Error updating closest speaker shape:', error);
			}

			if (!response) {
				setStatus('error');
				return;
			}

			window.location.href = `/listen?latitude=${location.lat}&longitude=${location.lng}`;

			setStatus('submitted');
		}
	}

	return {
		status,
		start,
	};
};
