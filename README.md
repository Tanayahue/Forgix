# Forgix

Forgix is an AI-native website generation platform that turns ideas into responsive, editable landing pages. Users can create sites from a prompt, recreate a design from a screenshot, or reconstruct a page from a live URL, then refine and deploy the result through a single product workflow.

Built as a full-stack application, Forgix combines a React frontend with an Express and MongoDB backend, authenticated user sessions, credit-based generation, payment flows, persisted website history, and public deployment through shareable slugs.

## Overview

Forgix is designed around a practical end-to-end creation loop:

1. Authenticate the user
2. Accept a generation source: prompt, image, or URL
3. Generate a complete responsive HTML document through an AI pipeline
4. Persist the generated artifact and conversation history
5. Allow iterative updates against the latest saved code
6. Deduct credits per action
7. Deploy the final output to a public route

This makes the system more than a one-off generator. It behaves like a product workflow with state, billing, editing, and delivery.

## Key Capabilities

- Prompt-to-website generation for greenfield landing pages
- Image-to-website reconstruction from screenshots
- URL-to-website recreation from existing live pages
- Iterative edit flow against previously generated HTML
- Credit-based usage model for generation and updates
- Dashboard-driven website management
- Public deployment with slug-based routes
- Payment flow for credit upgrades
- Responsive, animated product-facing interface

## Architecture

### Frontend

The frontend is a React 19 application powered by Vite. It is responsible for:

- auth-aware navigation and routing
- dashboard and generation workflows
- pricing and checkout entry points
- code editing and preview experiences
- deployed public site rendering
- centralized user state with Redux Toolkit

### Backend

The backend is an Express service backed by MongoDB. It handles:

- authentication and session validation
- website persistence and retrieval
- generation and update orchestration
- credit accounting
- deployment metadata and slug creation
- billing endpoints and payment verification

### Generation Model

Forgix stores generated HTML as a first-class artifact. Each website record maintains:

- the latest generated code
- the user and AI conversation trail
- deployment state
- a public slug when deployed

This model keeps generation, iteration, and publishing cleanly separated.

## Tech Stack

### Client

- React 19
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Monaco Editor
- Firebase
- Motion
- Axios

### Server

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Cookie Parser
- CORS
- Razorpay

## Repository Structure

```text
Forgix/
|-- client/   # React application
`-- server/   # Express API and generation backend
```

## Local Development

### Prerequisites

- Node.js 18+
- npm
- MongoDB connection
- Firebase project credentials
- AI provider credentials
- Razorpay test or live keys

### Installation

```bash
git clone https://github.com/Tanayahue/Forgix.git
cd Forgix
```

Install client dependencies:

```bash
cd client
npm install
```

Install server dependencies:

```bash
cd ../server
npm install
```

### Environment Configuration

Create local `.env` files in both `client/` and `server/` using the provided `.env.example` files as templates.

Typical values include:

Client:
- Firebase configuration
- Backend base URL

Server:
- MongoDB URI
- JWT secret
- AI provider key
- Razorpay key and secret
- Frontend URL for deployed link generation

### Running the Application

Start the frontend:

```bash
cd client
npm run dev
```

Start the backend:

```bash
cd server
npm run dev
```

## API Surface

Representative endpoints:

- `POST /api/website/generate`
- `POST /api/website/update/:id`
- `GET /api/website/get-all`
- `GET /api/website/get-by-id/:id`
- `GET /api/website/deploy/:id`
- `GET /api/website/site/:slug`
- `POST /api/billing`
- `POST /api/billing/verify`
- authentication and user profile routes

## Engineering Highlights

- Multi-input generation pipeline with text, screenshot, and URL-based creation paths
- Stateful iteration where updates run against the latest saved HTML
- Credit enforcement at the API layer to keep access control and billing aligned
- Public deployment model that separates private editing from published access
- Clear client-server separation with a straightforward local developer workflow

## Product Direction

Forgix is aimed at users who want faster first drafts without giving up control over the output. The current implementation focuses on generation, iteration, and deployment, with a foundation that can be extended into richer export, collaboration, and publishing features.

Potential next steps:

- custom domain support
- static bundle export
- collaborative editing
- template systems by industry
- version history and rollback

## License

No license has been added yet. All rights remain with the repository owner until a license is explicitly included.
