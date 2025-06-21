import express from 'express';
import OstrichDB from '../index';

const app = express();
app.use(express.json());

function getDBClient(authToken: string) {
  return new OstrichDB({
    baseUrl: process.env.OSTRICHDB_URL || 'http://localhost:8042',
    apiKey: authToken
  });
}

app.post('/api/users', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const db = getDBClient(token);
    const { email, name, age } = req.body;

    if (!email || !name || !age) {
      return res.status(400).json({ error: 'Missing required fields: email, name, age' });
    }

    const userManagement = db.project('user-management');
    const users = userManagement.collection('users');
    const activeUsers = users.cluster('active');

    try {
      await userManagement.create();
      await users.create();
      await activeUsers.create();
    } catch (error: any) {
      console.log('Resources may already exist:', error.message);
    }

    const userId = `user-${Date.now()}`;
    await activeUsers.record(`${userId}-email`, 'STRING', email).create(`${userId}-email`, 'STRING', email);
    await activeUsers.record(`${userId}-name`, 'STRING', name).create(`${userId}-name`, 'STRING', name);
    await activeUsers.record(`${userId}-age`, 'INTEGER', age.toString()).create(`${userId}-age`, 'INTEGER', age.toString());
    await activeUsers.record(`${userId}-created`, 'DATETIME', new Date().toISOString()).create(`${userId}-created`, 'DATETIME', new Date().toISOString());

    res.status(201).json({ 
      success: true, 
      userId,
      message: 'User created successfully' 
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const db = getDBClient(token);
    const users = db.project('user-management').collection('users').cluster('active');

    const emailRecords = await users.searchRecords({
      search: 'email',
      sortBy: 'name'
    });

    const userList = emailRecords.map(record => {
      const match = record.match(/^(user-\d+)-email :STRING: (.+)$/);
      if (match) {
        return {
          userId: match[1],
          email: match[2]
        };
      }
      return null;
    }).filter(Boolean);

    res.json({ users: userList });

  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/search', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { minAge, maxAge, name } = req.query;
    const db = getDBClient(token);
    const users = db.project('user-management').collection('users').cluster('active');

    let results;

    if (minAge || maxAge) {
      results = await users.searchRecords({
        search: 'age',
        type: 'INTEGER',
        minValue: minAge as string,
        maxValue: maxAge as string,
        sortBy: 'value'
      });
    } else if (name) {
      results = await users.searchRecords({
        search: 'name',
        valueContains: name as string
      });
    } else {
      return res.status(400).json({ error: 'Please provide search criteria' });
    }

    res.json({ results });

  } catch (error: any) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', async (req: any, res: any) => {
  try {
    const db = new OstrichDB({
      baseUrl: process.env.OSTRICHDB_URL || 'http://localhost:8042'
    });

    const dbHealth = await db.health_check();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      dbHealth
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  });
}

export default app;