const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs.json');

if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, JSON.stringify([], null, 2));
}

function loggingMiddleware(req, res, next) {
  const startTime = new Date();


  const originalJson = res.json.bind(res);
  let responseBody = null;

  res.json = function (body) {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    const logEntry = {
      timestamp: startTime.toISOString(),
      method: req.method,
      endpoint: req.originalUrl,
      requestBody: req.body || {},
      responseStatus: res.statusCode,
      responseBody: responseBody,
    };

    let logs = [];
    try {
      const data = fs.readFileSync(logFilePath, 'utf8');
      logs = JSON.parse(data);
    } catch (e) {
      logs = [];
    }

    logs.push(logEntry);
    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
  });

  next();
}

module.exports = loggingMiddleware;