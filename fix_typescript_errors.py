#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json

# Fix TypeScript errors by creating proper package.json and installing dependencies

base = "e:/tik"

# Create apps/web package.json
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
        "lucide-react": "^0.395.0"
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

# Create packages/sdk package.json
sdk_package = {
    "name": "@ai-task-escrow/sdk",
    "version": "0.1.0",
    "description": "TypeScript SDK for the AI Task Escrow Router protocol",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "exports": {
        ".": {
            "import": "./dist/index.js",
            "require": "./dist/index.cjs",
            "types": "./dist/index.d.ts"
        }
    },
    "scripts": {
        "build": "tsup src/index.ts --format esm,cjs --dts",
        "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
        "lint": "tsc --noEmit",
        "test": "vitest run"
    },
    "dependencies": {
        "@multiversx/sdk-core": "^13.5.0",
        "@multiversx/sdk-network-providers": "^2.4.0"
    },
    "devDependencies": {
        "tsup": "^8.0.0",
        "typescript": "^5.5.0",
        "vitest": "^1.6.0"
    },
    "files": ["dist"]
}

# Create Next.js config
next_config = '''/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig'''

# Create TypeScript config for web app
tsconfig_web = '''{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}'''

# Create TypeScript config for SDK
tsconfig_sdk = '''{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "node",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}'''

# Write files
os.makedirs(f"{base}/apps/web", exist_ok=True)
with open(f"{base}/apps/web/package.json", "w", encoding='utf-8') as f:
    json.dump(apps_web_package, f, indent=2)

os.makedirs(f"{base}/packages/sdk", exist_ok=True)
with open(f"{base}/packages/sdk/package.json", "w", encoding='utf-8') as f:
    json.dump(sdk_package, f, indent=2)

with open(f"{base}/apps/web/next.config.js", "w", encoding='utf-8') as f:
    f.write(next_config)

with open(f"{base}/apps/web/tsconfig.json", "w", encoding='utf-8') as f:
    f.write(tsconfig_web)

with open(f"{base}/packages/sdk/tsconfig.json", "w", encoding='utf-8') as f:
    f.write(tsconfig_sdk)

print("✅ Fixed TypeScript configuration!")
print("📁 Created package.json files")
print("🔧 Created TypeScript configs")
print("📦 Run 'npm install' in apps/web and packages/sdk")
