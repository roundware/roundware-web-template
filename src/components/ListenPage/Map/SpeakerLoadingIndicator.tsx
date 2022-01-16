import { useRoundware } from 'hooks';
import Backdrop from '@mui/material/Backdrop';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';

interface Props {}

const SpeakerLoadingIndicator = (props: Props) => {
	const { roundware } = useRoundware();
	const speakerPlayers = roundware.mixer.speakerTracks?.map((s) => s.player);
	const [loadingSpeakers, setLoadingSpeakers] = useState<{ id: number; value: number }[]>([]);
	useEffect(() => {
		speakerPlayers?.forEach((p) =>
			p.onLoadingProgress((per: number) => {
				if (per <= 100)
					setLoadingSpeakers((prev) => [
						...prev.filter((s) => s.id != p.id),
						{
							id: p.id,
							value: per,
						},
					]);
				else setLoadingSpeakers((prev) => [...prev.filter((s) => s.id != p.id)]);
			})
		);
	}, [speakerPlayers]);

	if (loadingSpeakers.every((s) => s.value == 100)) return null;
	return (
		<Backdrop open sx={(theme) => ({ zIndex: theme.zIndex.appBar + 1 })}>
			<Stack spacing={1}>
				<Typography variant='h5'>Downloading awesome music... Please wait</Typography>
				{loadingSpeakers
					.sort((a, b) => (a.id > b.id ? -1 : 1))
					.map((s) => (
						<LinearProgress variant='determinate' value={s.value} key={s.id} />
					))}
			</Stack>
		</Backdrop>
	);
};

export default SpeakerLoadingIndicator;
