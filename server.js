const express = require('express'); // importing a CommonJS module
const helmet = require('helmet');
const logger = require('morgan');


const hubsRouter = require('./hubs/hubs-router.js');

const server = express();

// global middleware

server.use(express.json());
server.use(helmet());
server.use(logger('dev'));

// custom global middleware

server.use(methodLogger);
server.use(addName);
// server.use(lockout);
//server.use(moodyGateKeeper);

server.use('/api/hubs', hubsRouter);

server.get('/', (req, res, next) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

function methodLogger(req, res, next) {
  console.log(`${req.method} Request`);
  next();
}

function addName(req, res, next) {
  req.name = "Cassandra";
  next();
}

function lockout(req, res, next) {
  res.status(403).json({ message: 'API lockout!'});
}

function moodyGateKeeper(req, res, next) {
  const seconds = new Date().getSeconds();

  if (seconds % 3 === 0) {
    res.status(403).json({ message: 'you shall not pass!' });
  } else {
    next();
  }
}

module.exports = server;
