#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json

base = "e:/tik"

# Update package.json to include local SDK dependency
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
        "@ai-task-escrow/sdk": "workspace:*"
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

# Update root package.json to use npm instead of pnpm
root_package = {
    "name": "ai-task-escrow-router",
    "version": "0.1.0",
    "description": "AI Task Escrow Router - On-chain escrow and settlement protocol for AI-mediated task execution on MultiversX",
    "private": True,
    "workspaces": [
        "apps/web",
        "packages/sdk",
        "packages/indexer"
    ],
    "scripts": {
        "build": "npm run build --workspaces",
        "dev": "npm run dev --workspaces",
        "test": "npm run test --workspaces",
        "lint": "npm run lint --workspaces",
        "clean": "npm run clean --workspaces",
        "contract:build": "cd contracts/router && mxpy contract build",
        "contract:test": "cd contracts/router && mxpy contract test",
        "contract:deploy": "cd contracts/router && mxpy contract deploy"
    },
    "devDependencies": {
        "@types/node": "^20.0.0",
        "typescript": "^5.0.0"
    },
    "engines": {
        "node": ">=18.0.0",
        "npm": ">=9.0.0"
    }
}

# Write updated package.json files
with open(f"{base}/apps/web/package.json", "w", encoding='utf-8') as f:
    json.dump(apps_web_package, f, indent=2)

with open(f"{base}/package.json", "w", encoding='utf-8') as f:
    json.dump(root_package, f, indent=2)

print("✅ Fixed SDK import dependency!")
print("📦 Updated package.json files")
print("🚀 Run 'npm install' in root directory")
