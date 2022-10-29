const dotenv = require('dotenv')
dotenv.config();
const { Client } = require('pg');
const client = new Client({"connectionString": process.env.CONNECTION_STRING});

async function executeQuery(query,logMessage)
{
	client.connect();
	var resp;
	resp = await client.query(query);
	console.log(logMessage);
	client.end();
	return resp.rows;
};
module.exports={executeQuery};