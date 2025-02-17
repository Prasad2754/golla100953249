const express = require('express');
const app = express();
const db = require('./persistence');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

app.use(express.json());
app.use(express.static(__dirname + '/static'));

// ✅ Health check endpoint (Cloud Run health check)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API routes
app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

// ✅ Fix: Use Cloud Run compatible port and bind to "0.0.0.0"
const port = process.env.PORT || 8080;

console.log(`🟡 Starting application on port ${port}...`);

db.init()
  .then(() => {
    console.log("✅ Database initialized successfully!");
    app.listen(port, "0.0.0.0", () => console.log(`🚀 Server is running on port ${port}`));
  })
  .catch((err) => {
    console.error("❌ Database initialization failed:", err);
    process.exit(1);
  });

// ✅ Graceful shutdown handling
const gracefulShutdown = () => {
  console.log("⚠️ Received shutdown signal. Closing database...");

  db.teardown()
    .then(() => {
      console.log("✅ Database closed. Exiting...");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Error closing database:", err);
      process.exit(1);
    });
};

// ✅ Handle termination signals (Cloud Run, Kubernetes, Nodemon)
process.on('SIGINT', gracefulShutdown);  // Ctrl+C
process.on('SIGTERM', gracefulShutdown); // Cloud Run shutdown signal
process.on('SIGUSR2', gracefulShutdown); // Nodemon restart
