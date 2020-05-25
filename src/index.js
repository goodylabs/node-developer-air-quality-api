/**
 * Entry point for the application in development/production mode
 * In the testing mode the server is mocked by the superagent module,
 * and this file actually never executes
 */

const config = require('config');
const port = config.get('port');
const app = require('./app');
require('./db/db_update');

app.listen(port, async () => {
    console.log(`Server is up on port ${port}`);
});
