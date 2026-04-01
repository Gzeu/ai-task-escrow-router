import { WebSocket } from 'ws';
import Database from 'better-sqlite3';
import express from 'express';

const GATEWAY_WS = 'wss://devnet-gateway.multiversx.com/websocket';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';

// SQLite pentru dev, PostgreSQL pentru prod
const db = new Database(process.env.DB_PATH || './dev.db');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    task_id TEXT UNIQUE NOT NULL,
    creator TEXT NOT NULL,
    assignee TEXT,
    token_id TEXT NOT NULL,
    amount TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    description TEXT,
    result_hash TEXT,
    created_at INTEGER,
    updated_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS agents (
    address TEXT PRIMARY KEY,
    reputation_score INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    staked_amount TEXT DEFAULT '0'
  );
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(creator);
`);

// WebSocket listener
function startIndexer() {
  const ws = new WebSocket(GATEWAY_WS);

  ws.on('open', () => {
    console.log('[Indexer] Connected to MultiversX Gateway');
    // Subscribe la events din contractul nostru
    ws.send(JSON.stringify({
      subscriptionEntries: [{
        address: CONTRACT_ADDRESS,
        identifier: '*',
      }],
    }));
  });

  ws.on('message', (data: Buffer) => {
    try {
      const event = JSON.parse(data.toString());
      handleEvent(event);
    } catch (e) {
      console.error('[Indexer] Parse error:', e);
    }
  });

  ws.on('close', () => {
    console.log('[Indexer] Disconnected — reconnecting in 5s...');
    setTimeout(startIndexer, 5000);
  });
}

function handleEvent(event: any) {
  const { identifier, topics, address } = event;
  if (address !== CONTRACT_ADDRESS) return;

  switch (identifier) {
    case 'taskCreated':
      // topics[0]=taskId, topics[1]=creator, topics[2]=tokenId, topics[3]=amount
      db.prepare(`
        INSERT OR REPLACE INTO tasks (task_id, creator, token_id, amount, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'open', ?, ?)
      `).run(
        topics[0], // task_id
        topics[1], // creator
        topics[2], // token_id
        topics[3], // amount
        Date.now(), // created_at
        Date.now()  // updated_at
      );
      break;

    case 'taskAccepted':
      db.prepare(`UPDATE tasks SET assignee=?, status='accepted', updated_at=? WHERE task_id=?`)
        .run(topics[1], Date.now(), topics[0]);
      break;

    case 'taskCompleted':
      db.prepare(`UPDATE tasks SET status='completed', result_hash=?, updated_at=? WHERE task_id=?`)
        .run(topics[1], Date.now(), topics[0]);
      break;

    case 'disputeOpened':
      db.prepare(`UPDATE tasks SET status='disputed', updated_at=? WHERE task_id=?`)
        .run(Date.now(), topics[0]);
      break;
  }
}

// REST API
const app = express();

app.get('/api/tasks', (req, res) => {
  const { status, token, limit = 50 } = req.query;
  let query = 'SELECT * FROM tasks';
  const params: any[] = [];
  const conditions: string[] = [];

  if (status) { conditions.push('status = ?'); params.push(status); }
  if (token) { conditions.push('token_id = ?'); params.push(token); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(Number(limit));

  res.json(db.prepare(query).all(...params));
});

app.get('/api/tasks/:taskId', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE task_id = ?').get(req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.get('/api/agents/:address', (req, res) => {
  const agent = db.prepare('SELECT * FROM agents WHERE address = ?').get(req.params.address);
  const tasks = db.prepare('SELECT * FROM tasks WHERE assignee = ? ORDER BY created_at DESC LIMIT 20').all(req.params.address);
  res.json({ agent, tasks });
});

app.get('/api/stats', (req, res) => {
  const stats = {
    totalTasks: db.prepare('SELECT COUNT(*) as c FROM tasks').get(),
    completedTasks: db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status='completed'").get(),
    openTasks: db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status='open'").get(),
    topTokens: db.prepare('SELECT token_id, COUNT(*) as count FROM tasks GROUP BY token_id ORDER BY count DESC LIMIT 5').all(),
  };
  res.json(stats);
});

startIndexer();
app.listen(3001, () => console.log('[Indexer] API running on :3001'));
