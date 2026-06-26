# Travel AI Planner

AI-powered travel itinerary planner. Users upload booking PDFs/images, we extract details, feed Google Gemini to generate day-by-day itineraries, and store them in MongoDB.

## Features
- JWT auth (register, login, refresh)
- Multi-file upload (PDF, JPG, PNG) with progress UI
- PDF parsing via pdf-parse, OCR via Tesseract.js
- Gemini prompt engineering for flight/hotel extraction and itinerary generation
- Save, view, edit, share itineraries
- Responsive, modern UI built with React 19, Vite, TailwindCSS

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, React Router, Axios, Zod, Lucide-React
- **Backend:** Node 18, Express, TypeScript, MongoDB Atlas, Mongoose, JWT, bcrypt, Multer
- **AI:** Google Gemini API
- **Deploy:** Vercel (frontend) + Render (backend)
