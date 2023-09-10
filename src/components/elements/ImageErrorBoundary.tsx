class ImageErrorBoundary extends React.Component<{}, { hasError: boolean }> {
	constructor(props: {}) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(): { hasError: boolean } {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error(error, errorInfo);
	}

	render(): React.ReactNode {
		if (this.state.hasError) {
			return null;
		}

		return this.props.children;
	}
}
