const express = require('express');
const { loggingMiddleware, log } = require('../logging_middleware/logger');

const app = express();
app.use(express.json());
app.use(loggingMiddleware); // ✅ auto-logs every request

// ✅ Manual log example anywhere in your code:
log('frontend', 'info', 'handler', 'Server started successfully');

// Example route
app.post('/api/register', (req, res) => {
  res.json({ clientId: '12345' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});