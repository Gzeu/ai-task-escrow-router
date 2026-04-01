#!/bin/bash

# AI Task Escrow Router - DevNet Deployment Script v0.3.0
# This script deploys the AI Task Escrow Router contract to MultiversX DevNet

set -e

# Configuration
CONTRACT_NAME="router-escrow"
NETWORK="devnet"
CHAIN_ID="D"
GAS_LIMIT="100000000"
PROXY="https://devnet-gateway.multiversx.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI Task Escrow Router v0.3.0 - DevNet Deployment${NC}"
echo -e "${BLUE}================================================${NC}"

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if mxpy is installed
if ! command -v mx &> /dev/null; then
    echo -e "${RED}❌ mxpy not found. Please install MultiversX CLI tools.${NC}"
    echo "Visit: https://github.com/multiversx/mx-cli-py"
    exit 1
fi

# Check if wallet is configured
if [ -z "$MX_WALLET" ]; then
    echo -e "${RED}❌ MX_WALLET environment variable not set.${NC}"
    echo "Please set your wallet address: export MX_WALLET=erd1..."
    exit 1
fi

# Check if PEM file exists
if [ -z "$MX_PEM" ]; then
    echo -e "${RED}❌ MX_PEM environment variable not set.${NC}"
    echo "Please set your PEM file path: export MX_PEM=/path/to/wallet.pem"
    exit 1
fi

if [ ! -f "$MX_PEM" ]; then
    echo -e "${RED}❌ PEM file not found: $MX_PEM${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Build contract
echo -e "${YELLOW}🔨 Building contract...${NC}"
cd ../contracts/router

# Clean previous builds
rm -rf output/
rm -rf target/

# Build contract
if ! cargo build --release; then
    echo -e "${RED}❌ Contract build failed${NC}"
    exit 1
fi

# Check if WASM file was created
if [ ! -f "target/wasm32-unknown-unknown/release/$CONTRACT_NAME.wasm" ]; then
    echo -e "${RED}❌ WASM file not found after build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract built successfully${NC}"

# Get contract bytecode
CONTRACT_BYTECODE=$(mx data --hexdump "target/wasm32-unknown-unknown/release/$CONTRACT_NAME.wasm")

if [ -z "$CONTRACT_BYTECODE" ]; then
    echo -e "${RED}❌ Failed to get contract bytecode${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract bytecode extracted${NC}"

# Deploy contract
echo -e "${YELLOW}🚀 Deploying contract to DevNet...${NC}"

# Prepare deploy arguments
OWNER_HEX=$(mx data --hexdump "$MX_WALLET")
TREASURY_HEX=$(mx data --hexdump "$MX_WALLET")
FEE_BPS="300"
MIN_REPUTATION="0"
MAX_CONCURRENT_TASKS="10"

# Deploy contract
DEPLOY_RESULT=$(mx contract deploy \
    --bytecode "$CONTRACT_BYTECODE" \
    --arguments "$OWNER_HEX" "$TREASURY_HEX" "$FEE_BPS" "$MIN_REPUTATION" "$MAX_CONCURRENT_TASKS" \
    --gas-limit "$GAS_LIMIT" \
    --chain "$CHAIN_ID" \
    --proxy "$PROXY" \
    --pem "$MX_PEM" \
    --send)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Contract deployment failed${NC}"
    exit 1
fi

# Extract contract address from deploy result
CONTRACT_ADDRESS=$(echo "$DEPLOY_RESULT" | grep -o 'erd1[^[:space:]]*' | head -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}❌ Could not extract contract address from deployment result${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract deployed successfully!${NC}"
echo -e "${BLUE}📍 Contract Address: $CONTRACT_ADDRESS${NC}"

# Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"

sleep 5

# Get contract configuration
CONFIG_RESULT=$(mx contract query "$CONTRACT_ADDRESS" \
    --function getConfig \
    --proxy "$PROXY" \
    --chain "$CHAIN_ID")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contract is live and responding${NC}"
    
    # Parse and display configuration
    OWNER=$(echo "$CONFIG_RESULT" | grep -o 'erd1[^[:space:]]*' | head -1)
    echo -e "${BLUE}📊 Contract Configuration:${NC}"
    echo -e "   Owner: $OWNER"
    echo -e "   Fee BPS: $FEE_BPS"
    echo -e "   Min Reputation: $MIN_REPUTATION"
    echo -e "   Max Concurrent Tasks: $MAX_CONCURRENT_TASKS"
else
    echo -e "${RED}❌ Contract verification failed${NC}"
    exit 1
fi

# Save deployment info
DEPLOYMENT_FILE="../deployments/devnet-$(date +%Y%m%d-%H%M%S).json"
mkdir -p ../deployments

cat > "$DEPLOYMENT_FILE" << EOF
{
  "version": "0.3.0",
  "network": "devnet",
  "contractAddress": "$CONTRACT_ADDRESS",
  "deployer": "$MX_WALLET",
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "transactionHash": "$(echo "$DEPLOY_RESULT" | grep -o 'txHash: [^[:space:]]*' | cut -d' ' -f2)",
  "gasUsed": "$(echo "$DEPLOY_RESULT" | grep -o 'gasUsed: [^[:space:]]*' | cut -d' ' -f2)",
  "configuration": {
    "owner": "$OWNER",
    "feeBps": "$FEE_BPS",
    "minReputation": "$MIN_REPUTATION",
    "maxConcurrentTasks": "$MAX_CONCURRENT_TASKS"
  },
  "endpoints": {
    "createTask": "createTask",
    "acceptTask": "acceptTask",
    "submitResult": "submitResult",
    "approveTask": "approveTask",
    "cancelTask": "cancelTask",
    "addTokenToWhitelist": "addTokenToWhitelist",
    "stakeReputation": "stakeReputation",
    "createOrganization": "createOrganization",
    "getTaskStatistics": "getTaskStatistics"
  }
}
EOF

echo -e "${GREEN}✅ Deployment info saved to: $DEPLOYMENT_FILE${NC}"

# Update environment file
ENV_FILE="../.env.devnet"
cat > "$ENV_FILE" << EOF
# AI Task Escrow Router - DevNet Configuration v0.3.0
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
NEXT_PUBLIC_CHAIN_ID=$CHAIN_ID
NEXT_PUBLIC_API_URL=$PROXY
NEXT_PUBLIC_VERSION=0.3.0

# Token Configuration
NEXT_PUBLIC_SUPPORTED_TOKENS=EGLD,USDC-abcdef,UTK-123456,MEX-789012
NEXT_PUBLIC_DEFAULT_TOKEN=EGLD

# Frontend Configuration
NEXT_PUBLIC_APP_NAME=AI Task Escrow Router
NEXT_PUBLIC_APP_DESCRIPTION=Decentralized AI task execution platform
NEXT_PUBLIC_APP_VERSION=v0.3.0
EOF

echo -e "${GREEN}✅ Environment file updated: $ENV_FILE${NC}"

# Display next steps
echo -e "${BLUE}🎯 Deployment Complete!${NC}"
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Update frontend configuration: cp $ENV_FILE ../apps/web/.env.local"
echo -e "2. Start frontend: cd ../apps/web && npm run dev"
echo -e "3. Test contract functionality"
echo -e "4. Monitor contract on Explorer: https://devnet-explorer.multiversx.com/accounts/$CONTRACT_ADDRESS"

echo -e "${GREEN}🎉 AI Task Escrow Router v0.3.0 successfully deployed to DevNet!${NC}"
