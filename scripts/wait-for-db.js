const net = require('net');
const { Client } = require('pg');

const host = process.env.POSTGRES_HOST || 'localhost';
const port = parseInt(process.env.POSTGRES_PORT || '5433', 10);
const user = 'lucrai';
const password = process.env.POSTGRES_PASSWORD || '';
const database = 'lucrai';
const timeout = parseInt(process.env.WAIT_TIMEOUT || '60', 10) * 1000;
const pollInterval = 1500;

async function waitForPostgres() {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection(port, host);
        socket.on('connect', () => {
          socket.destroy();
          resolve();
        });
        socket.on('error', reject);
        socket.setTimeout(3000);
        socket.on('timeout', () => {
          socket.destroy();
          reject(new Error('timeout'));
        });
      });

      const client = new Client({ host, port, user, password, database });
      await client.connect();
      await client.query('SELECT 1');
      await client.end();

      console.log(`PostgreSQL ready (${Date.now() - start}ms)`);
      return;
    } catch {
      process.stderr.write('.');
      await new Promise(r => setTimeout(r, pollInterval));
    }
  }

  console.error('\nTimed out waiting for PostgreSQL');
  process.exit(1);
}

waitForPostgres();
