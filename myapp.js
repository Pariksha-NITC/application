const express = require('express')
const dotenv = require('dotenv')
dotenv.config();
const { Client } = require('pg');
const client = new Client({"connectionString": process.env.CONNECTION_STRING});
client.connect();

const app = express()
const port = process.env.PORT;

const executeQuery = (query,logMessage) => {
	client.query(query, (err, res) => {
															if (err) {
																console.log(err);
																return;
															}
															console.log(logMessage);
															client.end();
														}
						);
};

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/initialize', (req, res) => {
  const query = `CREATE TABLE IF NOT EXISTS login (
							UserId varchar,
							Password varchar
						);
						
						
						`;
	const logMessage = 'Table is successfully created';
	executeQuery(query,logMessage)
  res.send(logMessage);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})