const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 1999; 

const commonResponse = function (data, error) {
    if (error) {
        return {
            success: false,
            error: error
        }
    }
    return {
        success: true,
        data: data
    }
};


const mysqlCon = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE
});

const mysqlConProduction = mysql.createConnection(
    // `${process.env.MYSQL_RAILWAY}`
    "mysql://root:PPAW8IBvRiQhELsCZDlO@containers-us-west-174.railway.app:7763/railway"
);


mysqlConProduction.connect((err) => {
    if (err) { 
        throw err
    }
    console.log("Database connected Railway")
});

const mysqlCondev = mysql.createConnection({
    host: process.env.MYSQL_HOST_PRODUCTION,
    port: process.env.MYSQL_PORT_PRODUCTION,
    user: process.env.MYSQL_USER_PRODUCTION,
    password: process.env.MYSQL_PASS_PRODUCTION,
    database: process.env.MYSQL_DATABASE_PRODUCTION
});

mysqlCon.connect((err) => {
    if (err) { 
        return console.log(err)
    }
    console.log("Database connected dev")
});

// async function checkConnection() {
//     try {
//         const connection = await mysqlCon.connect();
//         console.log("database connected")
//     }
//     catch (err){ 
//         console.log(err)
//     }
// }

// checkConnection()

const query = (query, values) => {
    return new Promise((resolve, reject) => {
        mysqlCon.query(query, values, (err, result, fields) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}



app.use(bodyParser.json())

app.get('/users', (request, response) => {
    console.log("masuk")
    mysqlCon.query("select * from users", (err, result, fields) => {
        if (err) {
            console.error(err)
            response.status(500).json({err: "server error"})
            response.end()
            return
        }
        response.status(200).json({success: "succes", data: result})
        response.end()
    })
}); 

 
app.get('/users/:id', async (request, response) => {
    const id = request.params.id;
    mysqlCon.query(
        `SELECT
        u.id,
        u.name,
        u.address,
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS balance,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS expense
        FROM user u
        LEFT JOIN transactions t ON u.id = t.user_id
        WHERE u.id = ?
        GROUP BY u.id;`, [id], (err, result, fields) => {
            if (err) {
                console.error(err)
                response.status(500).json(commonResponse(null, "response error"))
                response.end()
                return
            }
            if(result.affectedRows !==0) {
                console.log("transaction connected", result);
                response.status(200).json(commonResponse(result))
                response.end()
            } else{
                response.status(404).send("user id not found")
            }
        }
    )
});

app.get('/transactions', (request, response) => {
    console.log("masuk")
    mysqlCon.query("select * from transactions", (err, result, fields) => {
        if (err) {
            console.error(err)
            response.status(500).json({err: "server error"})
            response.end()
            return
        }
        response.status(200).json({success: "succes", data: result})
        response.end()
    })
}); 

app.post('/transactions', async (request, response) => {
    const {type, amount, user_id} = request.body
    console.log(request.body);
    mysqlCon.query(
        `INSERT INTO transactions 
        (user_id, type, amount)
        VALUES(${user_id}, "${type}", ${amount})`,
        (err, result, fields) => {
            if(err) {
                console.error(err)
                response.status(500).json(commonResponse(null, "response error"))
                response.end()
                return
            }
            console.log("transaction connected", result);
            response.status(200).json(commonResponse(result .insertId, null))
            response.end()
        }
    )
})

app.put('/transactions/:id', async (request, response) => {
    const id = request.params.id;
    const {type, amount, user_id} = request.body
    console.log(request.body)
    mysqlCon.query(
        `UPDATE transactions 
        SET user_id=?, type=?, amount=?
        WHERE id=?`,[user_id, type, amount, id],
        (err, result, fields) => {
            if (err) {
                console.error(err)
                response.status(500).json((null, "response error"))
                response.end()
                return
            }
                console.log("transaction connected", result);
                response.status(200).json({id: id})
                response.end()
        }
    )
});
 
app.delete('/transactions/:id', async (request, response) => {
    const id = request.params.id;
    mysqlCon.query(
    `DELETE FROM transactions
    WHERE id = ?`, [id],
        (err, result, fields) => {
            if (err) {
                console.error(err)
                response.status(500).json(commonResponse (null, "response error"))
                response.end()
                return
            }
            if(result.affectedRows !==0){
                console.log("transaction connected", result);
                response.status(200).json({id: id})
                response.end()
            } else {
                response.status(404).send("transaction id not found")
            }
        }
)});


app.listen(port, () => {
    console.log(`Server is running at  http://localhost:${port}`);
});
