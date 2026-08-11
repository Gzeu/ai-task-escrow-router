# AI Task Escrow Router - Deployment Runbook

## Prerequisites

### 1. GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### For DevNet:
- `DEVNET_PROXY`: `https://devnet-gateway.multiversx.com`
- `DEVNET_PEM`: Your wallet PEM file content (multiline)

#### For MainNet:
- `MAINNET_PROXY`: `https://gateway.multiversx.com`
- `MAINNET_PEM`: Your wallet PEM file content (multiline)

### 2. Wallet Setup

```bash
# Generate a new wallet (if needed)
mxpy wallet new --output wallet.pem

# Check balance
echo "erd1..." > wallet.txt
mxpy account balance --proxy https://devnet-gateway.multiversx.com --address $(cat wallet.txt)

# Fund from faucet
# Visit: https://devnet-wallet.multiversx.com/faucet
```

## Automated Deployment (GitHub Actions)

### Trigger Deployment

1. Push to `master` branch triggers CI/CD pipeline
2. Pipeline runs: tests → build → deploy to staging → e2e tests → deploy to production
3. Monitor progress in GitHub Actions tab

### Manual Deployment

```bash
# DevNet deployment
cd deploy
bash devnet-deploy.sh

# MainNet deployment (use with caution!)
powershell -File devnet-deploy.ps1  # Windows
```

## Post-Deployment Verification

### 1. Verify Contract Address

After deployment, note the contract address from the output:
```
contract address: erd1...
```

### 2. Check Contract on Explorer

```bash
# DevNet
explorer_url="https://devnet-explorer.multiversx.com/accounts/erd1..."

# MainNet
explorer_url="https://explorer.multiversx.com/accounts/erd1..."
```

### 3. Verify Contract Functions

```bash
# Query contract
mxpy contract query erd1... \
  --proxy https://devnet-gateway.multiversx.com \
  --function getRegistryAddress \
  --chain D
```

## Monitoring

### Health Checks

1. **Contract Status**: Check if contract is responsive
2. **Transaction History**: Monitor for failed transactions
3. **Gas Usage**: Track gas consumption per operation
4. **Error Rates**: Monitor failed contract calls

### Alerts Setup

```bash
# Add to monitoring system
- Alert if contract unreachable for > 5 minutes
- Alert if transaction failure rate > 10%
- Alert if gas price > 2x average
```

## Rollback Procedure

If deployment fails or issues are detected:

### 1. Immediate Rollback
```bash
# Redeploy previous version
mxpy contract upgrade \
  --bytecode output/router-escrow-old.wasm \
  --proxy ${{ secrets.DEVNET_PROXY }} \
  --chain D \
  --pem ${{ secrets.DEVNET_PEM }} \
  --gas-limit 100000000 \
  --send
```

### 2. Data Recovery
- Contract state is preserved on-chain
- No data loss during upgrade
- All historical transactions remain valid

## Troubleshooting

### Common Issues

1. **Insufficient Funds**
   - Ensure wallet has enough EGLD for deployment
   - DevNet: Get from faucet
   - MainNet: Transfer from exchange

2. **Gas Limit Too Low**
   - Increase gas limit: `--gas-limit 150000000`
   - Check contract complexity

3. **Compilation Errors**
   - Run `cargo build --release` locally first
   - Check Rust version matches CI (1.70.0)

4. **Network Issues**
   - Verify proxy URL is correct
   - Check network connectivity
   - Try alternative gateway

## Security Checklist

Before MainNet deployment:

- [ ] Security audit completed (task_0011)
- [ ] All tests passing (unit + integration)
- [ ] Code reviewed by 2+ team members
- [ ] Contract verified on explorer
- [ ] Monitoring and alerts configured
- [ ] Rollback plan tested
- [ ] Emergency pause mechanism in place

## Emergency Contacts

- **DevNet Issues**: MultiversX Discord #devnet-support
- **MainNet Issues**: MultiversX Discord #mainnet-support
- **Contract Issues**: Open GitHub issue with tag `critical`

---

*Last updated: 2026-08-11*
