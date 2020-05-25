# Node.js developer Air Quality API

## Installation
Run `yarn` to install dependencies\
\
It is required to set database uri for both 'production' and tests using `.env` file\
Variables:\
MONGODB_URI - connection uri for production mongodb\
MONGODB_TEST_URI  - connection uri for test mongodb\
\
**Running application**\
`yarn start`

**Running tests**\
`yarn test`

## API
URL: /stations\
Method: GET\
Description: Return list of stations

URL: /stations/:id\
Method: GET\
Description: Return station data

URL: /stations/:id/measurements\
Method: GET\
Description: Return latest measurement data

URL: /stations/:id/measurements/aggregated\
Method: GET
Description: Return aggregated measurement data\
Params:\
  from - date from which we want to calculate aggregated\
  to - date to which we want to calculate aggregated