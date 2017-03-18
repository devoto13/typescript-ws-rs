const express = require('express');
const app = express();

const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};

app.use(allowCrossDomain);

app.get('/users/:id', function (req, res) {
  console.log(req.queryParams);
  res.send(JSON.stringify({ id: req.params.id, name: 'John Doe', active: req.query.active }));
});

app.listen(8000, function () {
  console.log('API is listening on http://localhost:8000/...')
});
