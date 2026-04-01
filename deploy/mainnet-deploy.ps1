# AI Task Escrow Router - MainNet Deployment Script v0.3.0
# PowerShell script for deploying to MultiversX MainNet

param(
    [Parameter(Mandatory=$true)]
    [string]$WalletAddress,
    
    [Parameter(Mandatory=$true)]
    [string]$PemFile,
    
    [Parameter(Mandatory=$false)]
    [string]$GasLimit = "100000000",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipVerification
)

# Configuration
$CONTRACT_NAME = "router-escrow"
$NETWORK = "mainnet"
$CHAIN_ID = "1"
$PROXY = "https://gateway.multiversx.com"
$EXPLORER = "https://explorer.multiversx.com"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Invoke-CommandWithOutput {
    param([string]$Command, [string]$Arguments = "")
    
    try {
        if ($Arguments) {
            $result = Invoke-Expression "$Command $Arguments"
        } else {
            $result = Invoke-Expression $Command
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Success: $Command" $Green
            return $result
        } else {
            Write-ColorOutput "❌ Error: $Command (Exit Code: $LASTEXITCODE)" $Red
            return $null
        }
    } catch {
        Write-ColorOutput "❌ Exception: $Command - $($_.Exception.Message)" $Red
        return $null
    }
}

# Main deployment script
function Main {
    Write-ColorOutput "🚀 AI Task Escrow Router v0.3.0 - MainNet Deployment" $Cyan
    Write-ColorOutput "=================================================" $Cyan
    Write-ColorOutput "Network: MainNet" $Yellow
    Write-ColorOutput "Chain ID: $CHAIN_ID" $Yellow
    Write-ColorOutput "Wallet: $WalletAddress" $Yellow
    Write-ColorOutput "Contract: $CONTRACT_NAME" $Yellow
    Write-Host ""
    
    # Prerequisites check
    Write-ColorOutput "🔍 Checking prerequisites..." $Cyan
    
    $requiredCommands = @("mxpy", "cargo", "node", "npm")
    $missingCommands = @()
    
    foreach ($cmd in $requiredCommands) {
        if (-not (Test-Command $cmd)) {
            $missingCommands += $cmd
        }
    }
    
    if ($missingCommands.Count -gt 0) {
        Write-ColorOutput "❌ Missing required commands: $($missingCommands -join ', ')" $Red
        Write-ColorOutput "Please install missing dependencies and try again." $Red
        exit 1
    }
    
    Write-ColorOutput "✅ All prerequisites satisfied" $Green
    Write-Host ""
    
    # Check if PEM file exists
    if (-not (Test-Path $PemFile)) {
        Write-ColorOutput "❌ PEM file not found: $PemFile" $Red
        exit 1
    }
    
    # Navigate to contract directory
    $contractDir = "contracts\router"
    if (-not (Test-Path $contractDir)) {
        Write-ColorOutput "❌ Contract directory not found: $contractDir" $Red
        exit 1
    }
    
    Set-Location $contractDir
    Write-ColorOutput "📁 Changed to contract directory: $(Get-Location)" $Cyan
    Write-Host ""
    
    # Step 1: Build contract
    Write-ColorOutput "🔨 Step 1: Building smart contract..." $Cyan
    
    $buildResult = Invoke-CommandWithOutput "mxpy contract build"
    if (-not $buildResult) {
        Write-ColorOutput "❌ Contract build failed" $Red
        exit 1
    }
    
    # Check if build output exists
    $outputDir = "output"
    $wasmFile = "$outputDir\$CONTRACT_NAME.wasm"
    $abiFile = "$outputDir\$CONTRACT_NAME.abi.json"
    
    if (-not (Test-Path $wasmFile)) {
        Write-ColorOutput "❌ WASM file not found: $wasmFile" $Red
        exit 1
    }
    
    if (-not (Test-Path $abiFile)) {
        Write-ColorOutput "❌ ABI file not found: $abiFile" $Red
        exit 1
    }
    
    Write-ColorOutput "✅ Contract built successfully" $Green
    Write-Host ""
    
    # Step 2: Deploy contract
    Write-ColorOutput "🚀 Step 2: Deploying to MainNet..." $Cyan
    Write-ColorOutput "⚠️  WARNING: This will deploy to PRODUCTION MainNet!" $Red
    Write-ColorOutput "⚠️  Real funds will be used for deployment!" $Red
    Write-Host ""
    
    $confirm = Read-Host "Are you sure you want to continue? (type 'yes' to confirm)"
    if ($confirm -ne "yes") {
        Write-ColorOutput "❌ Deployment cancelled by user" $Yellow
        exit 0
    }
    
    # Prepare deploy command
    $deployCommand = "mxpy contract deploy --chain-id $CHAIN_ID --proxy $PROXY --pem `"$PemFile`" --gas-limit $GasLimit --outfile deploy.json --recall-nonce --send"
    
    Write-ColorOutput "📝 Deploy command prepared" $Cyan
    Write-ColorOutput "Executing deployment..." $Cyan
    
    $deployResult = Invoke-CommandWithOutput $deployCommand
    
    if (-not $deployResult) {
        Write-ColorOutput "❌ Contract deployment failed" $Red
        exit 1
    }
    
    # Extract contract address from deploy result
    try {
        $deployData = Get-Content "deploy.json" | ConvertFrom-Json
        $contractAddress = $deployData.emitted_tx.hash
        
        if (-not $contractAddress) {
            Write-ColorOutput "❌ Could not extract contract address from deployment result" $Red
            exit 1
        }
        
        Write-ColorOutput "✅ Contract deployed successfully!" $Green
        Write-ColorOutput "📍 Contract Address: $contractAddress" $Green
        Write-ColorOutput "🔍 Explorer: $EXPLORER/transactions/$contractAddress" $Cyan
    } catch {
        Write-ColorOutput "❌ Error parsing deployment result: $($_.Exception.Message)" $Red
        exit 1
    }
    
    Write-Host ""
    
    # Step 3: Initialize contract (optional)
    Write-ColorOutput "⚙️  Step 3: Initializing contract..." $Cyan
    
    $initCommand = "mxpy contract call --chain-id $CHAIN_ID --proxy $PROXY --pem `"$PemFile`" --gas-limit 50000000 --recall-nonce --send $contractAddress --function init --arguments 0x$($WalletAddress.Replace('0x','')) 0x$($WalletAddress.Replace('0x','')) 100:1000 500:1000 10:100"
    
    $initResult = Invoke-CommandWithOutput $initCommand
    
    if ($initResult) {
        Write-ColorOutput "✅ Contract initialized successfully" $Green
    } else {
        Write-ColorOutput "⚠️  Contract initialization failed - you may need to initialize manually" $Yellow
    }
    
    Write-Host ""
    
    # Step 4: Verify contract (optional)
    if (-not $SkipVerification) {
        Write-ColorOutput "🔍 Step 4: Verifying contract on MainNet..." $Cyan
        
        # Wait a bit for the transaction to be processed
        Write-ColorOutput "⏳ Waiting for transaction to be processed..." $Yellow
        Start-Sleep -Seconds 30
        
        $verifyCommand = "mxpy contract verify --chain-id $CHAIN_ID --proxy $PROXY --address $contractAddress"
        $verifyResult = Invoke-CommandWithOutput $verifyCommand
        
        if ($verifyResult) {
            Write-ColorOutput "✅ Contract verification submitted" $Green
        } else {
            Write-ColorOutput "⚠️  Contract verification failed - you may need to verify manually" $Yellow
        }
    } else {
        Write-ColorOutput "⏭️  Skipping contract verification" $Yellow
    }
    
    Write-Host ""
    
    # Step 5: Save deployment info
    Write-ColorOutput "💾 Step 5: Saving deployment information..." $Cyan
    
    $deploymentInfo = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
        network = $NETWORK
        chainId = $CHAIN_ID
        contractAddress = $contractAddress
        walletAddress = $WalletAddress
        gasLimit = $GasLimit
        explorer = $EXPLORER
        proxy = $PROXY
        version = "0.3.0"
    }
    
    $deploymentInfo | ConvertTo-Json -Depth 10 | Out-File -FilePath "deployment-mainnet.json" -Encoding UTF8
    Write-ColorOutput "✅ Deployment info saved to deployment-mainnet.json" $Green
    
    # Update environment file
    $envFile = "..\..\.env.production"
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile
        $envContent = $envContent -replace "^NEXT_PUBLIC_CONTRACT_ADDRESS=.*", "NEXT_PUBLIC_CONTRACT_ADDRESS=$contractAddress"
        $envContent = $envContent -replace "^NEXT_PUBLIC_NETWORK=.*", "NEXT_PUBLIC_NETWORK=$NETWORK"
        $envContent | Set-Content $envFile
        Write-ColorOutput "✅ Environment file updated: $envFile" $Green
    }
    
    Write-Host ""
    
    # Step 6: Display summary
    Write-ColorOutput "🎉 MainNet Deployment Summary" $Cyan
    Write-ColorOutput "=============================" $Cyan
    Write-ColorOutput "✅ Contract deployed to MainNet" $Green
    Write-ColorOutput "📍 Address: $contractAddress" $Green
    Write-ColorOutput "🔍 Explorer: $EXPLORER/transactions/$contractAddress" $Cyan
    Write-ColorOutput "📋 Deployment info saved to: deployment-mainnet.json" $Green
    Write-ColorOutput "🔧 Environment updated: .env.production" $Green
    Write-Host ""
    
    Write-ColorOutput "🚀 Next Steps:" $Cyan
    Write-ColorOutput "1. Verify contract on Explorer" $Yellow
    Write-ColorOutput "2. Update frontend configuration" $Yellow
    Write-ColorOutput "3. Deploy frontend to production" $Yellow
    Write-ColorOutput "4. Setup monitoring and alerts" $Yellow
    Write-ColorOutput "5. Announce to community" $Yellow
    Write-Host ""
    
    Write-ColorOutput "🎯 Production Deployment Complete!" $Green
    Write-ColorOutput "AI Task Escrow Router v0.3.0 is now live on MainNet!" $Green
}

# Execute main function
try {
    Main
} catch {
    Write-ColorOutput "❌ Fatal error: $($_.Exception.Message)" $Red
    Write-ColorOutput "❌ Stack trace: $($_.ScriptStackTrace)" $Red
    exit 1
}
