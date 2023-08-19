# API for Simple CRUD Mysql Node js 
## Introduction
This is a API for simple backend server for MBanking App using NodeJS & MySQL, that allows users to manipulate basic CRUD (Create, Read, Update, Delete) operations on application.
## Get Started
Before we start to build the server, first you need to download and install Node.Js, choose the latest LTS version of it.
Next, you must download and install MySQL server for database management system on the server.

For the first we create a new connection on mysql server and database mysql on DBeaver.
![1-create-new-connection database](https://github.com/RevoU-FSSE-2/week-9-haikalshahab93/blob/main/assets/savekoneksidb.png)

After this lets create a new table on database with DBeaver. We will use a relational model database on the table.
so for the spesifik you can see this

table users
```sql
-- CREATE TABLE USERS QUERY
CREATE TABLE users (
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(255),
	address TEXT
)
```

table transactions
```sql
-- CREATE TABLE TRANSACTIONS QUERY
CREATE TABLE transactions (
	id INT PRIMARY KEY AUTO_INCREMENT,
	user_id INT,
	type ENUM('income', 'expense'),
	amount DECIMAL(15, 2),
	FOREIGN KEY (user_id) REFERENCES users(id)
)
```

After you create the table of the structur you can create this example skema in

table users

```sql
-- INSERT DATA USERS QUERY
INSERT INTO users (name, address)
VALUES
    ('hai', '123 Main St'),
    ('haikal', '456 Elm St'),
    ('john', '789 Oak Ave'),
    ('justin', '567 Pine Rd'),
    ('budi', '890 Maple Ln');
```

Table : transactions
```sql
-- INSERT TABLE TRANSACTIONS QUERY
INSERT INTO transactions (user_id, type, amount) 
	VALUES 
	(4, 'income', 2800000),
	(5, 'income', 1100000),
	(4, 'expense', 650000),
	(5, 'expense', 340000);
```
## The Installed Package for the Project

1. `npm install body-parser` (Node.js body parsing middleware. Parse incoming request bodies in a middleware before your handlers, available under the req.body property.)

2. `npm install express` for install express js(minimalist web framework for Node.js).

3. `npm install mysql2` for intall MySQL client for Node.js (MySQL2 is free from native bindings and can be installed on Linux, Mac OS or Windows without any issues).

4. `npm install -D nodemon` for install nodemon, that is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.

## Making a connection server between NodeJS and MySQL
```javascript
const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')

const app = express()

// Middleware
app.use(bodyParser.json())

const ports = 3000

// Connecting to mysql server
const dbConnect = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'revoutugas-week9'
});
dbConnect.connect(err => {
    if (err) {
        console.error('Error, cannot connect to MySQL: ' + err.stack)
        return;
    }
    console.log('Success, has connected to MySQL')
});

// Start server
app.listen(ports, () => {
    console.log(`Server listening at http://localhost:${ports}`);
});
```

Run on terminal `npm start`, to start the server.

![2-start-server](https://github.com/RevoU-FSSE-2)

## Making a API routes for CRUD operations on server
Error Server Handling 
```javascript
// Common Response
const commonResponse = function (data, error) {
    if (error) {
        return {
            success: false,
            error: 'An error occurred while fetching user information'
        }
    }
    return {
        success: true,
        data: data
    }
}
```

GET user/:id -> for information with current balance and total accumulated expenses (balance = total income - total expense)
```javascript
// GET users/:id -> for information with balance and total expenses
app.get('/users/:id', (request, response) => {
    const userId = request.params.id;
    const sql = 'SELECT users.id, name, address, ' +
        'SUM(CASE WHEN type="income" THEN amount ELSE 0 END) AS total_income, ' +
        'SUM(CASE WHEN type="expense" THEN amount ELSE 0 END) AS total_expense ' +
        'FROM users ' +
        'LEFT JOIN transactions ON users.id = transactions.user_id ' +
        'WHERE users.id = ? ' +
        'GROUP BY users.id';
    dbConnect.query(sql, userId, (err, result, fields) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Have an Error"))
            response.end()
            return
        }
        const userData = {
            id: result[0].id,
            name: result[0].name,
            address: result[0].address,
            balance: result[0].total_income - result[0].total_expense,
            expense: result[0].total_expense
        }
        response.status(200).json(commonResponse(userData, null))
        response.end()
    })
})
```

POST /transaction -> for add new transaction
```javascript
// POST /transaction -> for add new transaction
app.post('/transactions', (request, response) => {
    const { user_id, type, amount } = request.body;
    const sql = 'INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)';
    dbConnect.query(sql, [user_id, type, amount], (err, result, fields) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Have an Error"))
            response.end()
            return
        }
        response.status(200).json({ message: 'Transaction added successfully', id: result.insertId })
        response.end()
    })
})
```

PUT /transactions/:id -> for update transaction
```javascript
// PUT /transactions/:id -> for update transaction 
app.put('/transactions/:id', (request, response) => {
    const transactionId = request.params.id;
    const { type, amount } = request.body;
    const sql = 'UPDATE transactions SET type = ?, amount = ? WHERE id = ?';

    dbConnect.query(sql, [type, amount, transactionId], (err) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Have an Error"))
            response.end()
            return
        }
        response.status(200).json({ message: 'Transaction updated successfully' })
        response.end()
    })
})
```

DELETE /transactions/:id -> for delete transaction
```javascript
// DELETE /transactions/:id -> for delete transaction 
app.delete('/transactions/:id', (request, response) => {
    const transactionId = request.params.id;
    const sql = 'DELETE FROM transactions WHERE id = ?';

    dbConnect.query(sql, [transactionId], (err) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Have an Error"))
            response.end()
            return
        }
        response.status(200).json({ message: 'Transaction deleted successfully' })
        response.end()
    })
})
```

## Testing Server on Locally
1. GET users/:id -> for information with current balance and total accumulated expenses (balance = total income - total expense)

![3-get-users-id](https://github.com/RevoU-FSSE-2/week-9-haikalshahab93/blob/main/assets/getdatauserid.png)

1. POST /transaction -> for add new transaction

![4-post-transaction](https://github.com/RevoU-FSSE-2/week-9-haikalshahab93/blob/main/assets/postdata.png)


1. PUT /transactions/:id -> for update transaction

![5-put-transaction-id](https://github.com/RevoU-FSSE-2/week-9-haikalshahab93/blob/main/assets/updatedata.png)

1. DELETE /transactions/:id -> for delete transaction

![6-delete-transaction-id](https://github.com/RevoU-FSSE-2/week-9-haikalshahab93/blob/main/assets/deleteimage-tes.png)

## Deploy
Database on 

![Deploy-database](https://github.com/RevoU-FSSE-2/)

API on app.cyclic.sh 

![Deploy-API-1](https://github.com/RevoU-FSSE-2)

![Deploy-API-2](https://github.com/RevoU-FSSE-2)

Deploy Link : 
