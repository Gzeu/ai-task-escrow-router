#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json

base = "e:/tik"

# Fix all remaining dependencies
apps_web_package = {
    "name": "@ai-task-escrow/web",
    "version": "0.1.0",
    "private": True,
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "type-check": "tsc --noEmit"
    },
    "dependencies": {
        "next": "^14.0.0",
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "lucide-react": "^0.395.0",
        "@tanstack/react-query": "^5.0.0",
        "react-hot-toast": "^2.4.0"
    },
    "devDependencies": {
        "@types/node": "^20.0.0",
        "@types/react": "^18.0.0",
        "@types/react-dom": "^18.0.0",
        "typescript": "^5.5.0",
        "tailwindcss": "^3.4.0",
        "autoprefixer": "^10.4.0",
        "postcss": "^8.4.0"
    }
}

# Fix next.config.js
next_config = '''/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@ai-task-escrow/sdk'],
}

module.exports = nextConfig'''

# Create simple _app.tsx
app_tsx = '''import type { AppProps } from 'next/app';
import { RouterEscrowProvider } from '@/contexts/RouterEscrowContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RouterEscrowProvider>
      <Component {...pageProps} />
    </RouterEscrowProvider>
  );
}'''

# Create globals.css
globals_css = '''@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300;
}

.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.container-wide {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}'''

# Write files
with open(f"{base}/apps/web/package.json", "w", encoding='utf-8') as f:
    json.dump(apps_web_package, f, indent=2)

with open(f"{base}/apps/web/next.config.js", "w", encoding='utf-8') as f:
    f.write(next_config)

os.makedirs(f"{base}/apps/web/src/pages", exist_ok=True)
with open(f"{base}/apps/web/src/pages/_app.tsx", "w", encoding='utf-8') as f:
    f.write(app_tsx)

os.makedirs(f"{base}/apps/web/src/styles", exist_ok=True)
with open(f"{base}/apps/web/src/styles/globals.css", "w", encoding='utf-8') as f:
    f.write(globals_css)

print("✅ Fixed all remaining issues!")
print("📦 Added missing dependencies")
print("🔧 Fixed Next.js config")
print("🎨 Created styles")
print("🚀 Run 'npm install' and 'npm run dev'")
