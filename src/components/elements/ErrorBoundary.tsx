import React from 'react';

class ErrorBoundary extends React.Component<
	{
		fallback?: React.ReactNode;
	},
	{
		hasError: boolean;
		error?: Error;
		info?: React.ErrorInfo;
	}
> {
	constructor(props: { fallback: React.ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		// Example "componentStack":
		//   in ComponentThatThrows (created by App)
		//   in ErrorBoundary (created by App)
		//   in div (created by App)
		//   in App
		// set error info to state
		this.setState({ error, info });
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
				this.props.fallback || (
					<div>
						<summary>Something went wrong.</summary>
						<details>
							{this.state.error?.toString()}
							{this.state.info?.componentStack}
						</details>
					</div>
				)
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
