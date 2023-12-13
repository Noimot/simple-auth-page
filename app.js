const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth');
const tasks = require('./task');
const {verifyToken} = require('./token');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerDocs');

const app = express();
const port = 3001;
const specs = swaggerJSDoc(swaggerDocs);

app.use(bodyParser.json());
app.use('/auth', auth.router);
app.get("/", (req, res) => res.send('here'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(verifyToken)
app.use('/tasks', tasks.router);

app.listen(port, () => console.log(`port: ${port}`))