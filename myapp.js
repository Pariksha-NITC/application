const express = require('express')
const expressHandlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
dotenv.config();


const app = express()
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }))
app.engine('handlebars', expressHandlebars({
defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');



const registerRoutes = require('./register');
app.use('/register',registerRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!')
}) 

app.listen(port, () => {
  console.log(`Quiz app listening on port ${port}`)
})
