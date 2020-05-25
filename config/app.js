require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  airApiBase: process.env.AIR_API_BASE || 'http://api.gios.gov.pl/pjp-api/rest',
  cronExpression: process.env.CRON_EXPRESSION || '15 * * * *',
};
