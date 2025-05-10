# Environment Setup

Create or open `.env`:

```
VITE_GOOGLE_MAPS_API_KEY='put your real google maps api key in .env.local'
VITE_GOOGLE_ANALYTICS_ID='put your real google analytics api key in .env.local'
PORT=1234
```

# Roundware Configuration

Open [`src/config.json`](src/config.json)

# Development

`npm start`

# Developing with Framework

```
cd roundware-web-framework
npm run watch

cd roundware-web-template
sudo npm link ../roundware-web-frameowrk
npm start
```

# Build

```
npm run build
```

# Testing

## Smoke Testing

The project uses Jest and React Testing Library for smoke testing. 
All smoke tests are located in the `src/__smoke__testing__` directory.

### Running Tests

1. Run all tests:
```
npm test
```

2. Run a specific test file:
```
npm test -- file.test.tsx
# or
npm test -- path/to/test/file.test.tsx
```
