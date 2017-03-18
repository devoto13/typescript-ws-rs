const express = require('express');
const app = express();

const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};

app.use(allowCrossDomain);

app.get('/test', function (req, res) {
  res.send(JSON.stringify({ id: 4, name: 'John Doe' }));
});

app.listen(8000, function () {
  console.log('API is listening on http://localhost:8000/...')
});
