# CloudShare (Frontend)

## Overview
This is the frontend client for the **CloudShare** application, a modern file sharing and storage platform. It is built using **Vite**, **React**, and **TailwindCSS**, providing a responsive and fast user interface.

## Tech Stack
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS 4
- **Authentication:** Clerk
- **HTTP Client:** Axios
- **Routing:** React Router DOM 7
- **Icons:** Lucide React

## Features
- **Responsive UI:** Modern design with TailwindCSS.
- **User Authentication:** Sign-up, Sign-in, and User Profiles via Clerk.
- **Dashboard:** Overview of files and account usage.
- **File Management:** Upload, view, and delete files.
- **Subscriptions:** Manage storage plans (Razorpay integration).
- **Public Links:** Share files publicly with unique links.

## Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Configuration
The application requires environment variables to run. Create a `.env` file in the root directory based on the following:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_RAZORPAY_KEY=your_razorpay_key
# Add VITE_API_URL if your backend is not on standard localhost proxy or if configured differently
```

## Installation & Running

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd cloudShare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure
```
src/
├── assets/          # Static assets
├── components/      # Reusable UI components
├── context/         # React Context API providers
├── layout/          # Layout components (Sidebar, Navbar)
├── pages/           # Page components (Dashboard, Upload, etc.)
├── util/            # Utility functions
├── App.jsx          # Main App component
└── main.jsx         # Entry point
```
