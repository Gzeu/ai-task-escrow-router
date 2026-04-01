# AI Task Escrow Router - DevNet Deployment Script v0.3.0
# PowerShell script for deploying to MultiversX DevNet

param(
    [Parameter(Mandatory=$true)]
    [string]$WalletAddress,
    
    [Parameter(Mandatory=$true)]
    [string]$PemFile
)

# Configuration
$ContractName = "router-escrow"
$Network = "devnet"
$ChainId = "D"
$GasLimit = "100000000"
$Proxy = "https://devnet-gateway.multiversx.com"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

Write-Host "🚀 AI Task Escrow Router v0.3.0 - DevNet Deployment" -ForegroundColor $Colors.Blue
Write-Host "================================================" -ForegroundColor $Colors.Blue

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor $Colors.Yellow

# Check if mxpy is installed
try {
    $null = Get-Command mx -ErrorAction Stop
    Write-Host "✅ mxpy found" -ForegroundColor $Colors.Green
} catch {
    Write-Host "❌ mxpy not found. Please install MultiversX CLI tools." -ForegroundColor $Colors.Red
    Write-Host "Visit: https://github.com/multiversx/mx-cli-py" -ForegroundColor $Colors.Yellow
    exit 1
}

# Check if PEM file exists
if (-not (Test-Path $PemFile)) {
    Write-Host "❌ PEM file not found: $PemFile" -ForegroundColor $Colors.Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor $Colors.Green

# Build contract
Write-Host "🔨 Building contract..." -ForegroundColor $Colors.Yellow
Set-Location ..\contracts\router

# Clean previous builds
Remove-Item -Recurse -Force output -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force target -ErrorAction SilentlyContinue

# Build contract
$buildResult = cargo build --release
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Contract build failed" -ForegroundColor $Colors.Red
    exit 1
}

# Check if WASM file was created
$wasmPath = "target\wasm32-unknown-unknown\release\$ContractName.wasm"
if (-not (Test-Path $wasmPath)) {
    Write-Host "❌ WASM file not found after build" -ForegroundColor $Colors.Red
    exit 1
}

Write-Host "✅ Contract built successfully" -ForegroundColor $Colors.Green

# Get contract bytecode
$bytecodeResult = mx data --hexdump $wasmPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to get contract bytecode" -ForegroundColor $Colors.Red
    exit 1
}

$ContractBytecode = $bytecodeResult.Trim()
Write-Host "✅ Contract bytecode extracted" -ForegroundColor $Colors.Green

# Deploy contract
Write-Host "🚀 Deploying contract to DevNet..." -ForegroundColor $Colors.Yellow

# Prepare deploy arguments
$OwnerHex = mx data --hexdump $WalletAddress
$TreasuryHex = mx data --hexdump $WalletAddress
$FeeBps = "300"
$MinReputation = "0"
$MaxConcurrentTasks = "10"

# Deploy contract
$deployArgs = @(
    "--bytecode", $ContractBytecode,
    "--arguments", $OwnerHex, $TreasuryHex, $FeeBps, $MinReputation, $MaxConcurrentTasks,
    "--gas-limit", $GasLimit,
    "--chain", $ChainId,
    "--proxy", $Proxy,
    "--pem", $PemFile,
    "--send"
)

$deployResult = mx contract deploy @deployArgs
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Contract deployment failed" -ForegroundColor $Colors.Red
    exit 1
}

# Extract contract address from deploy result
$ContractAddress = ($deployResult | Select-String -Pattern "erd1[^\s]*").Matches.Value | Select-Object -First 1)

if ([string]::IsNullOrEmpty($ContractAddress)) {
    Write-Host "❌ Could not extract contract address from deployment result" -ForegroundColor $Colors.Red
    exit 1
}

Write-Host "✅ Contract deployed successfully!" -ForegroundColor $Colors.Green
Write-Host "📍 Contract Address: $ContractAddress" -ForegroundColor $Colors.Blue

# Verify deployment
Write-Host "🔍 Verifying deployment..." -ForegroundColor $Colors.Yellow

Start-Sleep -Seconds 5

# Get contract configuration
$configResult = mx contract query $ContractAddress --function getConfig --proxy $Proxy --chain $ChainId
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contract is live and responding" -ForegroundColor $Colors.Green
    
    # Parse and display configuration
    $Owner = ($configResult | Select-String -Pattern "erd1[^\s]*").Matches.Value | Select-Object -First 1)
    Write-Host "📊 Contract Configuration:" -ForegroundColor $Colors.Blue
    Write-Host "   Owner: $Owner" -ForegroundColor $Colors.White
    Write-Host "   Fee BPS: $FeeBps" -ForegroundColor $Colors.White
    Write-Host "   Min Reputation: $MinReputation" -ForegroundColor $Colors.White
    Write-Host "   Max Concurrent Tasks: $MaxConcurrentTasks" -ForegroundColor $Colors.White
} else {
    Write-Host "❌ Contract verification failed" -ForegroundColor $Colors.Red
    exit 1
}

# Save deployment info
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$DeploymentFile = "..\deployments\devnet-$timestamp.json"
New-Item -ItemType Directory -Path "..\deployments" -Force | Out-Null

$deploymentInfo = @{
    version = "0.3.0"
    network = "devnet"
    contractAddress = $ContractAddress
    deployer = $WalletAddress
    deployedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    transactionHash = ($deployResult | Select-String -Pattern "txHash: [^\s]*").Matches.Value | Select-Object -First 1)
    gasUsed = ($deployResult | Select-String -Pattern "gasUsed: [^\s]*").Matches.Value | Select-Object -First 1)
    configuration = @{
        owner = $Owner
        feeBps = $FeeBps
        minReputation = $MinReputation
        maxConcurrentTasks = $MaxConcurrentTasks
    }
    endpoints = @{
        createTask = "createTask"
        acceptTask = "acceptTask"
        submitResult = "submitResult"
        approveTask = "approveTask"
        cancelTask = "cancelTask"
        addTokenToWhitelist = "addTokenToWhitelist"
        stakeReputation = "stakeReputation"
        createOrganization = "createOrganization"
        getTaskStatistics = "getTaskStatistics"
    }
}

$deploymentInfo | ConvertTo-Json -Depth 10 | Out-File -FilePath $DeploymentFile -Encoding UTF8

Write-Host "✅ Deployment info saved to: $DeploymentFile" -ForegroundColor $Colors.Green

# Update environment file
$EnvFile = "..\.env.devnet"
$envContent = @"
# AI Task Escrow Router - DevNet Configuration v0.3.0
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_CONTRACT_ADDRESS=$ContractAddress
NEXT_PUBLIC_CHAIN_ID=$ChainId
NEXT_PUBLIC_API_URL=$Proxy
NEXT_PUBLIC_VERSION=0.3.0

# Token Configuration
NEXT_PUBLIC_SUPPORTED_TOKENS=EGLD,USDC-abcdef,UTK-123456,MEX-789012
NEXT_PUBLIC_DEFAULT_TOKEN=EGLD

# Frontend Configuration
NEXT_PUBLIC_APP_NAME=AI Task Escrow Router
NEXT_PUBLIC_APP_DESCRIPTION=Decentralized AI task execution platform
NEXT_PUBLIC_APP_VERSION=v0.3.0
"@

$envContent | Out-File -FilePath $EnvFile -Encoding UTF8

Write-Host "✅ Environment file updated: $EnvFile" -ForegroundColor $Colors.Green

# Display next steps
Write-Host "🎯 Deployment Complete!" -ForegroundColor $Colors.Blue
Write-Host "Next Steps:" -ForegroundColor $Colors.Yellow
Write-Host "1. Update frontend configuration: Copy $EnvFile to ../apps/web/.env.local" -ForegroundColor $Colors.White
Write-Host "2. Start frontend: cd ../apps/web && npm run dev" -ForegroundColor $Colors.White
Write-Host "3. Test contract functionality" -ForegroundColor $Colors.White
Write-Host "4. Monitor contract on Explorer: https://devnet-explorer.multiversx.com/accounts/$ContractAddress" -ForegroundColor $Colors.White

Write-Host "🎉 AI Task Escrow Router v0.3.0 successfully deployed to DevNet!" -ForegroundColor $Colors.Green
