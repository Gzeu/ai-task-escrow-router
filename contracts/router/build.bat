@echo off
REM AI Task Escrow Router - Contract Build Script for Windows
REM This script builds the smart contract for deployment on DevNet

echo 🔧 Building AI Task Escrow Router Smart Contract...

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if mxpy is installed
python -c "import mxpy" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ mxpy not found. Installing mxpy...
    pip install mxpy
    if %errorlevel% neq 0 (
        echo ❌ Failed to install mxpy. Please install manually: pip install mxpy
        pause
        exit /b 1
    )
)

REM Check if multiversx-sdk is installed
python -c "import multiversx_sdk" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ multiversx-sdk not found. Installing...
    pip install multiversx-sdk
    if %errorlevel% neq 0 (
        echo ❌ Failed to install multiversx-sdk. Please install manually.
        pause
        exit /b 1
    )
)

REM Navigate to contract directory
cd /d "%~dp0"

echo 📦 Building contract...
python -m mxpy contract build

if %errorlevel% equ 0 (
    echo ✅ Contract built successfully!
    echo 📁 Output files:
    dir output\ /b
    
    REM Display contract information
    echo 🔍 Contract information:
    echo    - Contract name: router-escrow
    echo    - Version: 0.1.0
    echo    - Ready for DevNet deployment
    
    REM Show next steps
    echo 🚀 Next steps:
    echo    1. Deploy to DevNet: python -m mxpy contract deploy --network devnet
    echo    2. Verify contract: python -m mxpy contract verify --network devnet
    echo    3. Update frontend .env with contract address
    
) else (
    echo ❌ Contract build failed!
    echo 🔧 Check the following:
    echo    - Rust toolchain is installed (rustc --version)
    echo    - MultiversX SDK is installed
    echo    - Contract source code is valid
    pause
    exit /b 1
)

echo.
echo 🎉 Build script completed!
pause
