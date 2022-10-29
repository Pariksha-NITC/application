const dotenv = require('dotenv')
dotenv.config();
const { Client } = require('pg');


async function executeQuery(query,logMessage)
{
	const client = new Client({"connectionString": process.env.CONNECTION_STRING});
	client.connect();
	var resp;
	resp = await client.query(query);
	console.log(logMessage);
	client.end();
	return resp.rows;
};
module.exports={executeQuery};