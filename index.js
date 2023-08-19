import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Create a MySQL connection pool
const dbPool = mysql.createPool({
  host: "containers-us-west-69.railway.app",
  port: 7223,
  user: "root",
  password: "Iqcl5bTZ2ckLd2CuILUg",
  database: "railway",
});

// Common Response
const commonResponse = (data, error) => {
  if (error) {
    return {
      success: false,
      error: error,
    };
  }
  return {
    success: true,
    data: data,
  };
};

// GET /users/:id -> to get user information with specific balance and total expenses
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  const sql =
    "SELECT users.id, name, address, " +
    'SUM(CASE WHEN type="income" THEN amount ELSE 0 END) AS total_income, ' +
    'SUM(CASE WHEN type="expense" THEN amount ELSE 0 END) AS total_expense ' +
    "FROM users " +
    "LEFT JOIN transactions ON users.id = transactions.user_id " +
    "WHERE users.id = ? " +
    "GROUP BY users.id";
    
  dbPool.query(sql, userId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(commonResponse(null, "Server Have an Error"));
    }
    
    if (result.length === 0) {
      return res.status(404).json(commonResponse(null, "User not found"));
    }

    const userData = {
      id: result[0].id,
      name: result[0].name,
      address: result[0].address,
      balance: result[0].total_income - result[0].total_expense,
      expense: result[0].total_expense,
    };
    return res.status(200).json(commonResponse(userData, null));
  });
});

// POST /transactions -> to add a new transaction
app.post("/transactions", (req, res) => {
  const { user_id, type, amount } = req.body;
  const sql = "INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)";
  
  dbPool.query(sql, [user_id, type, amount], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(commonResponse(null, "Server Have an Error"));
    }
    
    return res.status(201).json({
      message: "Transaction added successfully",
      id: result.insertId,
    });
  });
});

// PUT /transactions/:id -> to update a transaction
app.put("/transactions/:id", (req, res) => {
  const transactionId = req.params.id;
  const { type, amount } = req.body;
  const sql = "UPDATE transactions SET type = ?, amount = ? WHERE id = ?";
  
  dbPool.query(sql, [type, amount, transactionId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json(commonResponse(null, "Server Have an Error"));
    }
    
    return res.status(200).json({ message: "Transaction updated successfully" });
  });
});

// DELETE /transactions/:id -> to delete a transaction
app.delete("/transactions/:id", (req, res) => {
  const transactionId = req.params.id;
  const sql = "DELETE FROM transactions WHERE id = ?";
  
  dbPool.query(sql, [transactionId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json(commonResponse(null, "Server Have an Error"));
    }
    
    return res.status(200).json({ message: "Transaction deleted successfully" });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
