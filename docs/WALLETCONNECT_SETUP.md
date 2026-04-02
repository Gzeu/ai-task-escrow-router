# WalletConnect Setup Guide

## 🔗 WalletConnect v2 Integration for AI Task Escrow Router

### 📋 Prerequisites
- WalletConnect Cloud account
- Project ID from WalletConnect Cloud
- Domain name (for production)
- SSL certificate (for production)

---

## 🚀 Step 1: Create WalletConnect Project

### 1.1 Sign up for WalletConnect Cloud
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or login with your GitHub/Google account
3. Verify your email address

### 1.2 Create New Project
1. Click "Create Project" in the dashboard
2. Fill in project details:
   - **Project Name**: AI Task Escrow Router
   - **Description**: Decentralized AI task management platform
   - **URL**: `https://your-domain.com` (development: `http://localhost:3000`)
   - **Icon**: Upload your app logo (512x512px recommended)
3. Select "MultiversX" as blockchain
4. Choose your plan (Free tier includes 1000 MAU)
5. Click "Create Project"

### 1.3 Get Project ID
1. After project creation, you'll see your **Project ID**
2. Copy this ID - you'll need it for the environment variables

---

## 🔧 Step 2: Configure Environment Variables

### 2.1 Update `.env.local`
```bash
# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID_HERE
NEXT_PUBLIC_WALLETCONNECT_METADATA_NAME=AI Task Escrow Router
NEXT_PUBLIC_WALLETCONNECT_METADATA_URL=https://your-domain.com
NEXT_PUBLIC_WALLETCONNECT_METADATA_ICON=https://your-domain.com/icon.png

# Feature Flags
NEXT_PUBLIC_ENABLE_WALLETCONNECT=true
NEXT_PUBLIC_MOCK_WALLET=false
```

### 2.2 Replace the Project ID
Replace `YOUR_WALLETCONNECT_PROJECT_ID_HERE` with your actual Project ID from WalletConnect Cloud.

### 2.3 Update Metadata
- **URL**: Your actual domain (development: `http://localhost:3000`)
- **Icon**: URL to your app icon (512x512px, PNG format)

---

## 🛠️ Step 3: Frontend Integration

### 3.1 WalletConnect Provider
The `WalletConnectProvider` is already integrated in `_app.tsx`:

```typescript
import { WalletConnectProvider } from '@/contexts/WalletConnectProvider';

function App() {
  return (
    <WalletConnectProvider>
      <EscrowProvider>
        {/* Your app content */}
      </EscrowProvider>
    </WalletConnectProvider>
  );
}
```

### 3.2 Wallet Connection
The wallet connection is handled by the `RouterEscrowContext` which uses `@multiversx/sdk-dapp` hooks:

```typescript
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';

const { address } = useGetAccountInfo();
```

---

## 🧪 Step 4: Testing the Integration

### 4.1 Development Testing
1. Start your development server:
   ```bash
   cd apps/web
   npm run dev
   ```

2. Open browser console to check WalletConnect status:
   ```
   🔗 WalletConnect Configuration: {
     projectId: 'SET',
     isWalletConnectEnabled: true,
     isMockWallet: false,
     environment: 'devnet',
     metadata: 'AI Task Escrow Router'
   }
   ```

3. Click "Connect Wallet" button
4. Select your preferred wallet (xPortal, Ledger, etc.)
5. Scan QR code with mobile wallet or use browser extension
6. Approve connection on your wallet
7. Verify wallet address appears in the app

### 4.2 Common Issues & Solutions

#### Issue: "WalletConnect is enabled but PROJECT_ID is not set"
**Solution**: Make sure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in `.env.local`

#### Issue: "Connection failed"
**Solution**: 
- Check your Project ID is correct
- Verify domain matches WalletConnect project settings
- Ensure SSL certificate for production

#### Issue: "Wallet not supported"
**Solution**: Use MultiversX-compatible wallets (xPortal, Ledger, Web Wallet)

---

## 🌐 Step 5: Production Deployment

### 5.1 Update Production Environment
```bash
# Production .env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-production-project-id
NEXT_PUBLIC_WALLETCONNECT_METADATA_URL=https://your-domain.com
NEXT_PUBLIC_WALLETCONNECT_METADATA_ICON=https://your-domain.com/icon.png
```

### 5.2 Update WalletConnect Project
1. Go to WalletConnect Cloud dashboard
2. Update your project URL to production domain
3. Upload production app icon
4. Save changes

### 5.3 SSL Certificate
Ensure your production domain has a valid SSL certificate (required for WalletConnect).

---

## 📱 Step 6: Supported Wallets

### Mobile Wallets
- **xPortal Mobile** - Official MultiversX wallet
- **MultiversX DeFi Wallet** - Third-party wallet
- **Trust Wallet** - Multi-chain wallet

### Desktop Wallets
- **xPortal Web Extension** - Browser extension
- **Ledger Hardware Wallet** - Hardware wallet
- **MultiversX Web Wallet** - Web-based wallet

### Connection Methods
- **QR Code** - Mobile wallet scanning
- **Deep Link** - Mobile wallet auto-launch
- **Browser Extension** - Direct connection
- **Hardware Wallet** - USB connection

---

## 🔍 Step 7: Troubleshooting

### 7.1 Debug Mode
Enable debug logging in development:
```typescript
// In WalletConnectProvider.tsx
console.log('🔗 WalletConnect Configuration:', config);
```

### 7.2 Common Errors

#### "Invalid session"
- Clear browser cache
- Reconnect wallet
- Check Project ID

#### "Domain not authorized"
- Update domain in WalletConnect Cloud
- Wait 5-10 minutes for propagation
- Check SSL certificate

#### "Connection timeout"
- Check internet connection
- Try different wallet
- Restart browser

### 7.3 Support Resources
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [MultiversX Wallet Guide](https://docs.multiversx.com/wallet/)
- [WalletConnect Discord](https://discord.gg/walletconnect)

---

## 📊 Step 8: Monitoring

### 8.1 WalletConnect Analytics
1. Go to WalletConnect Cloud dashboard
2. View project statistics:
   - Active users
   - Connection success rate
   - Popular wallets
   - Geographic distribution

### 8.2 Error Tracking
Monitor console for WalletConnect errors:
```javascript
// Add to your error tracking
window.addEventListener('error', (event) => {
  if (event.message.includes('walletconnect')) {
    // Track WalletConnect errors
  }
});
```

---

## ✅ Step 9: Verification Checklist

- [ ] WalletConnect project created
- [ ] Project ID copied to environment variables
- [ ] Metadata configured correctly
- [ ] Development testing successful
- [ ] Multiple wallet types tested
- [ ] Production domain configured
- [ ] SSL certificate installed
- [ ] Error monitoring in place
- [ ] Documentation updated

---

## 🎉 Success!

Your AI Task Escrow Router now supports WalletConnect v2! Users can connect their MultiversX wallets seamlessly across desktop and mobile devices.

### Next Steps:
1. Test with real wallet transactions
2. Add wallet connection analytics
3. Implement wallet-specific features
4. Add wallet connection recovery
5. Set up wallet connection notifications

---

**Need Help?**
- Check the [MultiversX Documentation](https://docs.multiversx.com/)
- Join the [MultiversX Discord](https://discord.gg/multiversx)
- Review [WalletConnect Best Practices](https://docs.walletconnect.com/best-practices)
