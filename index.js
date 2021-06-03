const express = require('express');

const app = express();

require('./config')(app);

app.listen(3000, () => {
  console.log('Jarret is running on http://localhost:3000');
});
