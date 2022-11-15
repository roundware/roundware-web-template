import { Alert, Box, Card, CardActions, CardContent, CardHeader, Fade, Paper, Slide, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import React, { useEffect, useMemo, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { useRoundware, useRoundwareDraft } from '../../hooks';
import { IMatch } from '../../types';
import { getRandomArbitrary, wait } from '../../utils';
import config from 'config.json';
import { ArrowForwardIosRounded } from '@mui/icons-material';
const useStyles = makeStyles((theme) => {
	return {
		tagCard: {
			padding: theme.spacing(4),
			cursor: 'pointer',
			backgroundColor: theme.palette.grey[700],
		},

		selectedTagCard: {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.primary.contrastText,
		},
	};
});

interface TagSelectFormProps {
	match: IMatch;
}
const TagSelectForm = ({ match }: TagSelectFormProps) => {
	const classes = useStyles();
	const { roundware } = useRoundware();
	const draftRecording = useRoundwareDraft();
	const history = useHistory();

	// figure out which tagGroup to show in this view
	let tagGroupIndex = 0;
	if (match.params.tagGroupIndex) {
		tagGroupIndex = parseInt(match.params.tagGroupIndex.toString());
	}
	const tagGroups = roundware.uiConfig.speak ? roundware.uiConfig.speak : [];
	const tagGroup = tagGroups[tagGroupIndex] || { display_items: [] };

	const choices = useMemo(() => {
		const c = tagGroup.display_items.filter((item) => {
			return item.parent_id === null || draftRecording.tags.includes(item.parent_id);
		});

		if (tagGroup.selection_method == 'random_single') {
			// randomly select one item from the list
			const randomIndex = Math.floor(getRandomArbitrary(0, c.length));
			console.log('randomIndex', randomIndex);
			draftRecording.selectTag(c[randomIndex].id);
			return [c[randomIndex]];
		} else if (tagGroup.selection_method == 'random_double') {
			// randomly select two items from the list
			const randomIndex1 = Math.floor(getRandomArbitrary(0, c.length));
			let randomIndex2 = Math.floor(getRandomArbitrary(0, c.length));
			while (randomIndex2 == randomIndex1) {
				randomIndex2 = Math.floor(getRandomArbitrary(0, c.length));
			}

			draftRecording.setTags([...draftRecording.tags, c[randomIndex1].id, c[randomIndex2].id]);
			return [c[randomIndex1], c[randomIndex2]];
		}

		return c;
	}, [tagGroup.display_items]);

	useEffect(() => {
		// make sure we're thinking about a loaded framework
		if (!roundware.uiConfig || !roundware.uiConfig.speak) {
			return;
		}
		if (choices.length === 0 && match.params.tagGroupIndex) {
			const previousIndex = parseInt(match.params.tagGroupIndex) - 1;
			if (previousIndex >= 0) {
				const previousUrl = match.path.replace(':tagGroupIndex', previousIndex.toString());
				history.replace(previousUrl);
				return;
			}
		}
	}, [choices, roundware.uiConfig]);

	useEffect(() => {
		if (config.ALLOW_SPEAK_TAGS !== true) {
			if (!roundware.uiConfig || !roundware.uiConfig.speak) {
				return;
			}
			// we will do this will submitting
			// const defaultTags = config.DEFAULT_SPEAK_TAGS;

			// const tagIds = defaultTags;

			// draftRecording.setTags(tagIds);
			history.replace('/speak/location');
		} else {
			return;
		}
	}, []);

	const toggleTagSelected = (tagId: number) => {
		const isSelected = draftRecording.tags.includes(tagId);
		let newTags;
		if (isSelected) {
			// remove that tag
			newTags = draftRecording.tags.filter((t) => t !== tagId);
		} else {
			// other tags in this set of choices should be unselected
			const choiceIds = choices.map((c) => c.id);
			newTags = draftRecording.tags.filter((t) => choiceIds.includes(t));
			newTags = [...newTags, tagId];
		}
		draftRecording.setTags(newTags);

		wait<void>(500).then(() => {
			goToNext();
		});
	};

	const [error, setError] = useState('');

	const goToNext = () => {
		if (!tagGroup.display_items.some((t) => draftRecording.tags.includes(t.id))) {
			setError('Please select an option!');
			return;
		}
		setError('');
		const isLastGroup = tagGroups.length <= tagGroupIndex + 1;
		window.scrollTo(0, 0);
		if (isLastGroup) {
			history.push('/speak/location');
		} else {
			const nextUrl = generatePath(match.path, { tagGroupIndex: tagGroupIndex + 1 });
			history.push(nextUrl);
		}
	};

	if (choices.length === 0) {
		return null;
	}
	return (
		<Container>
			<Card
				sx={{
					margin: 'auto',
				}}
			>
				<CardHeader title={tagGroup.header_display_text} titleTypographyProps={{ variant: 'h4', textAlign: 'center' }}></CardHeader>
				<CardContent>
					<Stack spacing={1}>
						{choices.map((choice, index) => {
							const isSelected = draftRecording.tags.includes(choice.id);
							return (
								<Fade in timeout={(index + 1) * 100}>
									<Paper
										key={choice.id}
										className={`${classes.tagCard} ${isSelected ? classes.selectedTagCard : ''}`}
										onClick={(e) => {
											toggleTagSelected(choice.id);
											e.preventDefault();
										}}
									>
										<FormControlLabel checked={isSelected} control={<Checkbox style={{ display: 'none' }} size={'medium'} />} label={<Typography children={[choice.tag_display_text]} />} />
									</Paper>
								</Fade>
							);
						})}
					</Stack>
					{!!error && (
						<Alert severity='error' sx={{ mt: 2 }}>
							{error}
						</Alert>
					)}
				</CardContent>

				<CardActions
					sx={{
						justifyContent: 'space-between',
						mx: 1,
						my: 1,
					}}
				>
					<Button
						variant={'contained'}
						startIcon={<ArrowBackIosIcon />}
						onClick={() => {
							if (tagGroupIndex === 0) {
								history.replace('/');
							} else {
								const nextUrl = generatePath(match.path, { tagGroupIndex: tagGroupIndex - 1 });
								history.replace(nextUrl);
							}
						}}
					>
						Back
					</Button>

					<Button variant='contained' endIcon={<ArrowForwardIosRounded />} onClick={goToNext}>
						Next
					</Button>
				</CardActions>
			</Card>
		</Container>
	);
};
export default TagSelectForm;
