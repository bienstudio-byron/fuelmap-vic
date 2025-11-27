# FuelMap VIC

A map-first web application to find the cheapest fuel in Victoria, Australia.

## Features

- **Map Interface**: View fuel stations on an interactive map.
- **Real-time Pricing**: Displays latest fuel prices (simulated in demo mode).
- **Filtering**: Filter by fuel type (U91, U95, U98, Diesel), brand, and radius.
- **Details**: View station details including address and last updated time.
- **Responsive**: Works on desktop and mobile.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: Leaflet (react-leaflet)
- **State Management**: TanStack Query

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd fuel-map-vic
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory.

#### Getting Real Data (Servo Saver API)

To use real data, you must apply for an API key from Service Victoria:

1.  Visit the [Service Victoria Servo Saver API page](https://service.vic.gov.au/find-services/transport-and-driving/servo-saver/help-centre/servo-saver-public-api).
2.  Submit an application for API access.
3.  Once approved, you will receive an **API Key**.

Add your key to the `.env.local` file:

```env
SERVO_SAVER_API_KEY=your_api_key_here
```

**Note:** Without this key, the application will automatically run in **Demo Mode**, generating realistic mock data for testing.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2.  Import the project in Vercel.
3.  Add the `SERVO_SAVER_API_KEY` to the Vercel project environment variables.
4.  Deploy.

## License

MIT
