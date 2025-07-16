const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// PostgreSQL config
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'varsha',
  port: 5432,
});

// Register API
app.post('/register', async (req, res) => {
  const {name, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO adlogin(name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashed]
    );

    res.status(201).json({ message: `User registered. Hello ${name}`,name });
  } catch (err) {
    console.error('db error:', err);
    res.status(400).json({ error: 'Email already used or error occurred' });
  }
});

// Login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM adlogin WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: 'Invalid email' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Wrong password' });

    res.json({ message: `Login successful. Welcome back, ${user.name}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));