# @ai-task-escrow/indexer

On-chain event indexer for the AI Task Escrow Router protocol on MultiversX.

Listens to smart contract events, indexes them in MongoDB, and exposes a REST API for the frontend and SDK consumers.

## Setup

```bash
cd packages/indexer
cp .env.example .env
# Fill in CONTRACT_ADDRESS, MONGODB_URL, etc.
pnpm dev
```

## Environment Variables

See [`.env.example`](../../packages/indexer/.env.example) for all required variables.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tasks` | List all indexed tasks |
| `GET` | `/tasks/:id` | Get task by ID |
| `GET` | `/tasks?creator=erd1...` | Filter tasks by creator |
| `GET` | `/tasks?agent=erd1...` | Filter tasks by agent |
| `GET` | `/stats` | Protocol statistics |
| `GET` | `/health` | Health check |

## Development

```bash
pnpm dev    # Start with hot reload
pnpm build  # Production build
pnpm test   # Run tests
```

## License

MIT
