require('dotenv').config()

const db = require('./db');
const {QueryFile} = require('pg-promise');

db.none(new QueryFile('./sql/initdb.sql', {minify: true}))
	.then(()=>{
		console.log('Tables are successfully created');
		console.log('Exiting...');
	})
	.catch((err)=> {
		throw err;
	});