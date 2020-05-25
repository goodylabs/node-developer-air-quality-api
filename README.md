# air-quality-app

Assuming that one has only barebones computer with OS, the following steps
are needed in order to start the application:

############

1. Install Node.js (from here https://nodejs.org/) and mongoDB Community
   Server (from here https://www.mongodb.com/download-center/community). The
   latest stable releases will do fine. For convenience one could also get
   some GUI client for Mongo like (https://robomongo.org/).

############

2. Create the data folder for MongoDB and start the MongoDB instance
   on the default port 27017 by running command like
   (pathToMongoDirectory/MongoDB/bin/mongod --dbpath ~/pathToDataFolder)
   in the terminal.
   If You want to run the app on some other port, please change the
   parameter dbpath in config files ('./config');

############

3. Navigate to the root folder of the project using the terminal.
   Run the command npm install to install the necessary dependencies.

############

4. From the root of the project folder in the terminal run the command
   npm start to launch the app. It is configured to run on localhost:3000.
   You can change the port in the files in ./config directory -
   (./config/default.json for running the app). You will see the
   'Server is up on port XXXX' message in the console to confirm the app
   is started and then can check out the routes.

############

5. The app exposes the following APIs ({url} depends on where You run
   the app):

1) {localhost:3000}/api/v1/stations - fetching data about air quality
   measurement stations
2) {localhost:3000}/api/v1/now/:id - fetching the data about current
   measurements for the station of interest (:id stands for numeric
   station id)
3) {localhost:3000}/api/v1/daily/:id?date=DD-MM-YYYY - get the average
   daily measurement for the specified station for the specified date
4) {localhost:3000}/api/v1/period/:id?from=DD-MM-YYYY&to=DD-MM-YY - get
   the average measurements for the specified station for the specified
   period.
   Please note that upon the first start of the app it takes 10-20 seconds
   in order to populate the database with initial data from GIOS. So
   immediate requests will send back either 404 or empty arrays - depending
   on whether the list of stations has been already saved to the database
   (that is done in the first place and occurs almost immediately).

############

6. The data for the app will be stored in the air-quality-app-api
   database. The test configuration will store the data under
   air-quality-app-api-test.

############

6. One can also issue the following commands for other actions with
   the app:

1) npm run dev - it runs the app wrapped into nodemon for hot reload during
   development
2) npm test - run the test suite with mocha (chai assertions)
3) npm run coverage - generate the test coverage report (nyc)
