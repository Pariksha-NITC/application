const dotenv = require('dotenv')
dotenv.config();
const { Client } = require('pg');
const client = new Client({"connectionString": process.env.CONNECTION_STRING});
client.connect();
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
module.exports={executeQuery};