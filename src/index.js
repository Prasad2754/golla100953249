const express = require('express');
const app = express();
const db = require('./persistence');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

app.use(express.json());
app.use(express.static(__dirname + '/static'));

app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

// ✅ Fix: Use environment variable for port to ensure Cloud Run compatibility
const port = process.env.PORT || 3000; 

db.init()
  .then(() => {
    app.listen(port, () => console.log(`Listening on port ${port}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

const gracefulShutdown = () => {
  db.teardown()
    .catch(() => {})
    .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);  // Handles Ctrl+C
process.on('SIGTERM', gracefulShutdown); // Cloud Run & Kubernetes shutdown signal
process.on('SIGUSR2', gracefulShutdown); // Sent by Nodemon for restart
