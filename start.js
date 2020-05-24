require('@babel/register')({
  presets: ['@babel/preset-env'],
});
require('regenerator-runtime/runtime');

module.exports = require('./app.js');
