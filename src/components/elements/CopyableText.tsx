import React, { useState, useRef, useEffect } from 'react';
import { Typography, Grid, Button, TextField, Stack } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CopyIcon from '@mui/icons-material/CopyAll';
interface Props {
	children?: string;
	value?: string;
}

const CopyableText = ({ children, value }: Props) => {
	const [copied, setCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement>();
	let link = value;
	if (!value) {
		link = children;
	}
	const handleCopy = () => {
		if (!link) return;
		copyTextToClipboard(link);
		setCopied(true);
		inputRef?.current?.blur();
		// inputRef?.current?.select();
	};

	useEffect(() => {
		setCopied(false);
		if (inputRef && inputRef.current) {
			inputRef.current.select();
			inputRef.current.onfocus = inputRef.current.select;
		}
	}, [inputRef, children]);

	return (
		<Stack spacing={1}>
			<TextField variant='filled' label='Link' fullWidth inputRef={inputRef} type='text' value={children} />

			<Button startIcon={copied ? <CheckIcon /> : <CopyIcon />} color='primary' onClick={handleCopy}>
				{copied ? `Copied` : `Copy to Clipboard`}
			</Button>
		</Stack>
	);
};

export default CopyableText;

function fallbackCopyTextToClipboard(text: string) {
	const textArea = document.createElement('textarea');
	textArea.value = text;

	// Avoid scrolling to bottom
	textArea.style.top = '0';
	textArea.style.left = '0';
	textArea.style.position = 'fixed';

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		const successful = document.execCommand('copy');
		const msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	document.body.removeChild(textArea);
}
function copyTextToClipboard(text: string) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text).then(
		function () {
			console.log('Async: Copying to clipboard was successful!');
		},
		function (err) {
			console.error('Async: Could not copy text: ', err);
		}
	);
}
