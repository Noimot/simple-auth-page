const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const auth = require('./auth');

const app = express();
const port = 3001;
app.use(bodyParser.json())

app.use('/auth', auth.router);

app.get('/protected', auth.authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

app.get("/", (req, res) => res.send('here'))

app.listen(port, () => console.log(`port: ${port}`))