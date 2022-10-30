const pgp = require('pg-promise')();

const connOpt = {
  user: process.env.PSQL_USERNAME,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT
};

const db = pgp(connOpt);

module.exports.db = db;
module.exports.QueryResultError = pgp.errors.QueryResultError;
module.exports.qrec = pgp.errors.queryResultErrorCode;