// const express = require('express');
// const mysql = require('mysql2/promise'); // Using promises for cleaner async/await handling
// const cors = require('cors');

// const app = express();
// const port = 3000;

// app.use(cors());
// app.use(express.json()); // Middleware to parse JSON bodies

// // Improved database connection handling with error catching and reconnection logic
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: 'Sakshi@123', // Consider using environment variables for sensitive information
//     database: 'stocks',
//   waitForConnections: true,
//   connectionLimit: 10, // Adjust connection limit as needed
//   queueLimit: 0 // No queueing for failed connections
// });

// pool.getConnection()
//   .then(connection => {
//     console.log('Connected to the MySQL database.');
//     connection.release(); // Release the connection back to the pool
//   })
//   .catch(err => {
//     console.error('Error connecting to MySQL:', err);
//   });
// // Route to handle adding a stock
// app.post('/list', async (req, res) => {
//     const { symbol, name, stocks, price } = req.body; // Destructure request body data
  
//     if (!symbol || !name || !stocks || !price) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }
  
//     try {
//       const connection = await pool.getConnection();
//       const query = `INSERT INTO unbought (symbol, name, stocks, price) VALUES (?, ?, ?, ?)`;
//       const [result] = await connection.execute(query, [symbol, name, stocks, price]);
  
//       if (result.affectedRows === 1) {
//         res.json({ message: 'Stock added successfully!' });
//       } else {
//         res.status(500).json({ message: 'Error adding stock.' });
//       }
  
//       connection.release(); // Release the connection back to the pool
//     } catch (err) {
//       console.error('Error adding stock:', err);
//       res.status(500).json({ message: 'Internal server error.' });
//     }
//   });

//   app.get('/stocks', async (req, res) => {
//     try {
//       const connection = await pool.getConnection();
//       const [rows] = await connection.execute('SELECT * FROM unbought');
//       connection.release();
  
//       res.json(rows);
//     } catch (err) {
//       console.error('Error fetching stocks:', err);
//       res.status(500).json({ message: 'Internal server error.' });
//     }
//   });
  

//   app.delete('/stock/:index', async (req, res) => {
//     const index = parseInt(req.params.index);
  
//     if (isNaN(index)) {
//       return res.status(400).json({ message: 'Invalid index number' });
//     }
  
//     try {
//       const connection = await pool.getConnection();
//       const [rows] = await connection.execute('SELECT * FROM unbought');
  
//       if (index < 0 || index >= rows.length) {
//         connection.release();
//         return res.status(400).json({ message: 'Index out of bounds' });
//       }
  
//       const stockToMove = rows[index];
//       const { symbol, name, stocks, price } = stockToMove;
  
//       const deleteQuery = 'DELETE FROM unbought WHERE id = ?';
//       await connection.execute(deleteQuery, [stockToMove.id]);
  
//       const insertQuery = 'INSERT INTO portfolio (symbol, name, stocks, price) VALUES (?, ?, ?, ?)';
//       await connection.execute(insertQuery, [symbol, name, stocks, price]);
  
//       connection.release();
//       res.json({ message: 'Stock moved to portfolio successfully!' });
//     } catch (err) {
//       console.error('Error moving stock to portfolio:', err);
//       res.status(500).json({ message: 'Internal server error.' });
//     }
//   });
  
  

// app.listen(port, () => {
//   console.log(`App is listening on port ${port}`);
// });






const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Sakshi@123', // Consider using environment variables for sensitive information
  database: 'stocks',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('Connected to the MySQL database.');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err);
  });

app.post('/list', async (req, res) => {
  const { symbol, name, stocks, price } = req.body;

  if (!symbol || !name || !stocks || !price) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const connection = await pool.getConnection();
    const query = `INSERT INTO unbought (symbol, name, stocks, price) VALUES (?, ?, ?, ?)`;
    const [result] = await connection.execute(query, [symbol, name, stocks, price]);

    if (result.affectedRows === 1) {
      res.json({ message: 'Stock added successfully!' });
    } else {
      res.status(500).json({ message: 'Error adding stock.' });
    }

    connection.release();
  } catch (err) {
    console.error('Error adding stock:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/stocks', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM unbought');
    connection.release();

    res.json(rows);
  } catch (err) {
    console.error('Error fetching stocks:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


app.delete('/stock/:index', async (req, res) => {
  const index = parseInt(req.params.index);

  if (isNaN(index)) {
    return res.status(400).json({ message: 'Invalid index number' });
  }

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM unbought');

    if (index < 0 || index >= rows.length) {
      connection.release();
      return res.status(400).json({ message: 'Index out of bounds' });
    }

    const stockToMove = rows[index];
    const { symbol, name, stocks, price } = stockToMove;

    const deleteQuery = 'DELETE FROM unbought WHERE symbol = ? AND name = ? AND stocks = ? AND price = ? LIMIT 1';
    await connection.execute(deleteQuery, [symbol, name, stocks, price]);

    const insertQuery = 'INSERT INTO portfolio (symbol, name, stocks, price) VALUES (?, ?, ?, ?)';
    await connection.execute(insertQuery, [symbol, name, stocks, price]);

    connection.release();
    res.json({ message: 'Stock moved to portfolio successfully!' });
  } catch (err) {
    console.error('Error moving stock to portfolio:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/portfolio', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM portfolio');
    connection.release();

    res.json(rows);
  } catch (err) {
    console.error('Error fetching portfolio:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
app.delete('/portfolio/:symbol/:price/:name/:stocks', async (req, res) => {
  const { symbol, price, name, stocks } = req.params;

  try {
    const [row] = await pool.execute('SELECT * FROM portfolio WHERE symbol = ?', [symbol]);

    if (row.length === 0) {
      return res.status(404).json({ message: 'Symbol not found in portfolio' });
    }

    const [result] = await pool.execute('DELETE FROM portfolio WHERE symbol = ?', [symbol]);

    if (result.affectedRows === 1) {
      await pool.execute('INSERT INTO unbought (symbol, name, stocks, price) VALUES (?, ?, ?, ?)', [symbol, name, parseInt(stocks), parseFloat(price)]);

      res.json({ message: 'Stock sold successfully and added to unbought' });
    } else {
      res.status(500).json({ message: 'Failed to sell stock' });
    }
  } catch (error) {
    console.error('Error selling stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
