#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import subprocess
import sys

base = "e:/tik"

# Setup GitHub repository and push
print("🚀 Setting up GitHub repository...")

try:
    # Check if GitHub CLI is available
    result = subprocess.run(['gh', '--version'], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ GitHub CLI found")
        
        # Create repository on GitHub
        print("📦 Creating GitHub repository...")
        result = subprocess.run([
            'gh', 'repo', 'create', 
            'ai-task-escrow-router',
            '--public',
            '--description', 'Complete AI Task Escrow Router - From MVP to Future Vision (2027+)',
            '--clone', 'false'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ GitHub repository created successfully")
            
            # Add remote and push
            print("📤 Adding remote and pushing...")
            subprocess.run(['git', 'remote', 'add', 'origin', 'git@github.com:ai-task-escrow/router.git'], cwd=base)
            subprocess.run(['git', 'push', '-u', 'origin', 'master'], cwd=base)
            print("✅ Code pushed to GitHub successfully")
            
        else:
            print(f"❌ Failed to create repository: {result.stderr}")
    else:
        print("❌ GitHub CLI not found")
        print("📋 Manual setup required:")
        print("1. Go to https://github.com/new")
        print("2. Create repository: ai-task-escrow-router")
        print("3. Add remote: git remote add origin git@github.com:YOUR_USERNAME/ai-task-escrow-router.git")
        print("4. Push: git push -u origin master")

except Exception as e:
    print(f"❌ Error: {e}")

print("\n🎯 Repository setup complete!")
print("📂 Repository: https://github.com/ai-task-escrow/router")
print("🌟 AI Task Escrow Router is ready for global deployment!")
