#!/bin/bash

# AI Task Escrow Router - Contract Build Script
# This script builds the smart contract for deployment on DevNet
# Updated for MX-8004 integration support

echo "🔧 Building AI Task Escrow Router Smart Contract..."

# Navigate to contract directory
cd "$(dirname "$0")"

# Check if wasm32-unknown-unknown target is installed
if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
    echo "📦 Installing WASM target..."
    rustup target add wasm32-unknown-unknown
fi

echo "📦 Building contract for WASM..."

# Build using cargo directly for better control
cargo build --release --target wasm32-unknown-unknown

if [ $? -eq 0 ]; then
    echo "✅ Contract built successfully!"
    mkdir -p output
    cp target/wasm32-unknown-unknown/release/router_escrow.wasm output/
    
    echo "📁 Output files:"
    ls -la output/
    
    # Display contract address information
    echo "🔍 Contract information:"
    echo "   - Contract name: router-escrow"
    echo "   - Version: 0.1.0"
    echo "   - Target: wasm32-unknown-unknown"
    echo "   - Ready for DevNet deployment"
    
    # Show next steps
    echo "🚀 Next steps:"
    echo "   1. Deploy to DevNet: mxpy contract deploy --network devnet"
    echo "   2. Verify contract: mxpy contract verify --network devnet"
    echo "   3. Update frontend .env with contract address"
    echo "   4. Register on MX-8004 network"
    
else
    echo "❌ Contract build failed!"
    echo "🔧 Check the following:"
    echo "   - Rust toolchain is installed (rustc --version)"
    echo "   - Dependencies are resolved"
    echo "   - Contract source code is valid"
    exit 1
fi
