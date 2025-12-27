# Net Manager AI — Network Device Manager

A small Next.js app for orchestrating SSH commands across network devices and generating automated commands with AI. The app integrates with an Apify Actor to perform device connections and command execution, and displays structured dataset results.

Features
- Device management form and payload preview
- Run Apify Actor from the browser with an API token
- AI-assisted command generation (Cohere integration optional)
- Results viewer: dataset table + raw key-value output
- Sonner-powered toasts and Tailwind-based UI

**Live Actor**: https://apify.com/srini047/network-device-manager

## Installation

- Requirements: Node.js 18+ and a package manager (npm / pnpm / yarn)

```bash
cd network-device-manager
npm install
```

## Environment

Create a `.env` (or set env vars in your platform) with the keys you need. Example variables used by the app:

- `APIFY_TOKEN` — optional local default token (the UI accepts a token in the dashboard)
- `COHERE_API_KEY` — optional, used if you enable Cohere AI command generation

The app also accepts the Apify token from the dashboard input (recommended for testing with multiple accounts).

## Run locally

```bash
npm run dev
```

Visit 🌐: http://localhost:3000

## Usage

- Open the dashboard: [app/dashboard/page.tsx](app/dashboard/page.tsx)
- Add one or more devices (IP, username, password/port)
- Optionally provide Cohere API key for AI command generation
- Click **Run Actor** to dispatch the job — you will see a toast on success or failure
- Export the `INPUT.json` to be used elsewhere too
- Reset to default values if you feel you have messed up

## Actor integration

The app calls your Apify Actor via the JS SDK from the server route at `app/api/apify/route.ts`.

- The route creates an `ApifyClient` with the provided token and calls the Actor with the payload.
- After the Actor finishes, the route reads the Actor run's default dataset and returns `items` to the client.

If you need to change which Actor is invoked, edit `app/api/apify/route.ts` and replace the Actor id.

## Troubleshooting

- If counts show incorrectly in the UI, the app now ignores any `OVERALL SUMMARY` rows in the dataset and derives totals from per-device rows.
- Failed connection entries are detected by inspecting `status` / `error` fields and will render in destructive (red) styling.
- If the actor returns unexpected JSON, paste the full response here and the UI logic can be adjusted.

## License

MIT

## Useful links
- Apify JS SDK Guides: https://docs.apify.com/sdk/js/docs/guides/apify-platform
- Actor Page: https://apify.com/srini047/network-device-manager

