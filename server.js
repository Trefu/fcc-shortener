require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const URI = process.env.DB_URI
var bodyParser = require('body-parser')
const { MongoClient } = require('mongodb');
const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// body parser activado 
app.use(bodyParser.urlencoded({ extended: false }))

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});