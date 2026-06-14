# CollabKart Frontend

Next.js + TypeScript + Tailwind CSS frontend for the CollabKart API.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Default API base URL:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

If the backend is running on another port, update `.env.local`.

## Routes

- `/` landing page
- `/login`
- `/register`
- `/creator/dashboard`
- `/brand/dashboard`
- `/creator/profile`
- `/brand/profile`
- `/campaigns`
- `/campaigns/[id]`
- `/brand/campaigns/new`
