const fs = require('fs');
const path = require('path');
const http = require('http');

const logFilePath = path.join(__dirname, 'logs.json');

if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, JSON.stringify([], null, 2));
}

function log(track, level, package_, message) {
  const logEntry = {
    track,
    level,
    package: package_,
    message
  };

  const body = JSON.stringify(logEntry);

  const options = {
    hostname: '20.207.122.201',
    port: 80,
    path: '/evaluation-service/logs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const req = http.request(options, (res) => {
  });

  req.on('error', () => {
  });

  req.write(body);
  req.end();
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

    
    const level = res.statusCode >= 500 ? 'fatal' : res.statusCode >= 400 ? 'error' : 'info';
    log('frontend', level, 'handler', `${req.method} ${req.originalUrl} → ${res.statusCode}`);
  });

  next();
}

module.exports = { loggingMiddleware, log };