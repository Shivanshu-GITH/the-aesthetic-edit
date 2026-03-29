# The Aesthetic Edit | Pinterest Affiliate Platform

A refined, Pinterest-first affiliate platform curated for fashion, home decor, and intentional living. Built with a focus on high-conversion Pinterest traffic, elegant aesthetics, and robust data tracking.

## 🌟 Features

- **Pinterest-First Architecture**: Rich Pin meta tags, Open Graph optimization, and integrated "Save to Pinterest" functionality.
- **Curated Shopping**: Filterable product grid with vibe-based discovery and affiliate click tracking.
- **The Journal**: A fully integrated blog system with "Shop the Look" sidebars and category-based inspiration.
- **Lead Generation**: Newsletter subscription with a free Pinterest Growth Guide lead magnet.
- **Admin Dashboard**: Real-time analytics for leads, clicks, and saves, plus a product visibility manager.
- **Performance Optimized**: Lazy loading, session-based caching, and pulsing skeleton states.
- **Resilient Infrastructure**: Built-in Error Boundary and custom 404 handling.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion.
- **Backend**: Express.js, SQLite (Better-SQLite3).
- **Icons**: Lucide React.
- **Data Layer**: Custom fetch hooks with session caching.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   ADMIN_PASSWORD=your_secure_password
   APP_URL=http://localhost:3000
   GEMINI_API_KEY=your_gemini_key
   ```
4. **Seed the Database**
   ```bash
   npm run seed
   ```
5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📜 Available Scripts

- `npm run dev`: Starts the Express server and Vite in development mode.
- `npm run build`: Builds the production-ready React application.
- `npm run start`: Starts the platform in production mode.
- `npm run seed`: Initializes the SQLite database with curated mock data.
- `npm run type-check`: Runs TypeScript compiler check.
- `npm run lint`: Alias for type-check.

## 📂 Project Structure

- `src/components`: Reusable UI components (Skeletons, SEO, etc).
- `src/pages`: Main application pages (Home, Shop, Admin, etc).
- `src/hooks`: Custom data-fetching hooks.
- `src/server`: Express routes, database configuration, and seeding logic.
- `data/`: SQLite database storage (git-ignored).

## 🚢 Deployment

### Monorepo (Recommended)
Deploy the entire repository to a platform like **Railway** or **Render**.
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`

### Separate Frontend/Backend
- **Backend**: Deploy to Railway/Render (Node.js runtime).
- **Frontend**: Deploy `dist/` folder to Vercel/Netlify. Ensure `VITE_APP_URL` points to your live backend.

---

Curated with ♡ by Anjali.
