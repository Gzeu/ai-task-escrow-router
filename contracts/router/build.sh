#!/bin/bash

# AI Task Escrow Router - Contract Build Script
# This script builds the smart contract for deployment on DevNet

echo "🔧 Building AI Task Escrow Router Smart Contract..."

# Check if mxpy is installed
if ! command -v mxpy &> /dev/null; then
    echo "❌ mxpy not found. Installing mxpy..."
    pip install mxpy
fi

# Check if multiversx-sdk is installed
if ! python -c "import multiversx_sdk" &> /dev/null; then
    echo "❌ multiversx-sdk not found. Installing..."
    pip install multiversx-sdk
fi

# Navigate to contract directory
cd "$(dirname "$0")"

echo "📦 Building contract..."
mxpy contract build

if [ $? -eq 0 ]; then
    echo "✅ Contract built successfully!"
    echo "📁 Output files:"
    ls -la output/
    
    # Display contract address information
    echo "🔍 Contract information:"
    echo "   - Contract name: router-escrow"
    echo "   - Version: 0.1.0"
    echo "   - Ready for DevNet deployment"
    
    # Show next steps
    echo "🚀 Next steps:"
    echo "   1. Deploy to DevNet: mxpy contract deploy --network devnet"
    echo "   2. Verify contract: mxpy contract verify --network devnet"
    echo "   3. Update frontend .env with contract address"
    
else
    echo "❌ Contract build failed!"
    echo "🔧 Check the following:"
    echo "   - Rust toolchain is installed (rustc --version)"
    echo "   - MultiversX SDK is installed"
    echo "   - Contract source code is valid"
    exit 1
fi
