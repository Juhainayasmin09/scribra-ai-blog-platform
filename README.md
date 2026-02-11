# Scribra – AI Blog Platform

Scribra is a modern, AI-assisted blogging platform built to provide a clean writing experience combined with social interaction features. It enables users to write, publish, discover, and engage with blog content in a content-first environment.

This project focuses on usability, clarity, and realistic platform behavior similar to production-grade publishing systems.

## Project Overview

- Scribra allows users to:

- Create and publish blog posts

- Generate content with AI assistance

- Browse a public blog feed

- Like posts

- Comment on posts

- Save posts to a personal Reading List

- Manage profile and avatar

- The platform is designed to feel like a real-world blogging application rather than a demo project.

## Key Features
### Public Home Feed

- Public blog feed

- AI-assisted editor

- Like and comment system

- Bookmark and Reading List

- Authentication and protected routes

- Light and dark mode support

## Tech Stack

### Frontend

- Next.js

- React

- Tailwind CSS

### Backend

- Node.js

- Express.js / API Routes

### Database

- PostgreSQL

### AI Integration

- External AI API

## Project Structure
```
scribra-ai-blog-platform/
 │
 ├── app/                # Core application routes
 ├── components/         # Reusable UI components
 ├── lib/                # Utility functions
 ├── database/           # Database configuration
 ├── public/             # Static assets
 └── styles/             # Global styling
```


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
