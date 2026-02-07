# NutriBin User

<img width="936" height="328" alt="image" src="https://github.com/user-attachments/assets/6c962171-3add-41db-a3ba-0d2597b2c2d6" />

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Project Status](https://img.shields.io/badge/status-Development-green.svg)](#)

NutriBin User is a comprehensive system designed for managing and monitoring smart waste bins. This repository contains the source code for both the backend API and the web-based management dashboard.

## Project Overview

NutriBin User is a platform designed to bridge the gap between household waste management and sustainable agriculture. It allows users to monitor waste levels, manage composting processes, and track fertilizer analytics.

### Tech Stack

- **Backend**: [NestJS](https://nestjs.com/) (TypeScript), [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/)), [Brevo](https://www.brevo.com/) (Email), [IprogSMS](https://iprogsms.com/) (SMS).
- **Frontend**: [React](https://react.dev/) (Vite), [Tailwind CSS](https://tailwindcss.com/), [Axios](https://axios-http.com/), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/).

## Project Structure

NutriBin User is split into two main parts:

- `Backend/`: A NestJS application handling the API, database, and third-party services.
- `Frontend/`: A Vite + React application for the web interface.

## Development Setup

### Prerequisites

- **Node.js**: v18+ (v20+ recommended).
- **npm**: v9+ (Installed with Node.js).
- **PostgreSQL**: Local instance or access to a Supabase project.

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file (copied from `.ENV` template if available). Key variables include:
   - `DATABASE_URL`: PostgreSQL connection string (Supabase).
   - `SUPABASE_URL`: Your Supabase project URL.
   - `SUPABASE_KEY`: Your Supabase API key.
   - `BREVO_API_KEY`: API key for Brevo email service.
   - `IPROG_SMS_API_TOKEN`: API token for IprogSMS.
   - `FRONTEND_URL`: `http://localhost:5173`
4. Start the development server:
   ```bash
   npm run backend
   ```
5. (Optional) Seed the database:
   ```bash
   npx ts-node scripts/seed-user.ts
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file:
   - `VITE_API_URL`: `http://localhost:3000`
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID.
4. Start the development server:
   ```bash
   npm run frontend
   ```

## Branching & PR Guidelines

- Create a feature branch from `main`: `feature/short-description` or `fix/short-description`.
- Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification if possible.
- Ensure your changes follow the existing code style and pass linting.

## Code Quality

- **Backend**:
  - Format code: `npm run format`
  - Lint code: `npm run lint`
  - Run tests: `npm run test`
- **Frontend**:
  - Lint code: `npm run lint`

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE).

---

Please refer to [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for more details.
