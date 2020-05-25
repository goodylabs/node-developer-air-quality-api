/**
 * This module configures the router for HTTP requests - four GET
 * requests as described in the specifications. The other requests
 * are matched to 404 page
 */
const express = require('express');
const moment = require('moment');
const air_data_repo = require('../repos/air_data_repo');
const station_data_repo = require('../repos/station_data_repo');

const router = new express.Router();

/**
 * @api {get}   /api/v1/stations    Request stations list
 * @apiName     GetStations
 * @apiGroup    Station
 *
 * @apiSuccess  {[Object]}          List of tracked air quality stations
 * @apiSuccess  {Object} city       City where the station is located
 * @apiSuccess  {String} address    Address of the station
 * @apiSuccess  {String} name       Station name
 * @apiSuccess  {Number} latitude   Geographical latitude of the station
 * @apiSuccess  {Number} longitude  Geographical longitude of the station
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *      "city": {
 *          "name": "Wrocław",
 *          "commune": {
 *              "name": "Wrocław",
 *              "district": "Wrocław",
 *              "province": "DOLNOŚLĄSKIE"
 *          },
 *          "city_id": 1064
 *      },
 *      "address": "ul. Bartnicza",
 *      "station_id": 114,
 *      "name": "Wrocław - Bartnicza",
 *      "latitude": 51.115933,
 *      "longitude": 17.141125
 *  }]
 *
 * @apiError StationsNotAvailable The stations list was not retrieved
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *          error: 'The list of stations is currently not available!',
 *     }
 */
router.get('/api/v1/stations', async (req, res) => {
    try {
        const stations = await station_data_repo.get_all();
        res.send(stations);
    } catch (e) {
        res.status(500).send({
            error: 'The list of stations is currently not available!',
        });
    }
});

/**
 * @api {get}   /api/v1/now/:id     Request current air quality data
 *                                  for particular station
 *
 * @apiName     GetCurrentStationData
 * @apiGroup    Records
 *
 * @apiParam    {Number}    id          ID of the requested station
 *
 * @apiSuccess  {Number}    station_id  ID of requested station
 * @apiSuccess  {[Object]}  values      Current measurements values
 * @apiSuccess  {Number}    sensor_id   ID of sensor providing values
 * @apiSuccess  {String}    param       Name of the parameter
 * @apiSuccess  {String}    key         Parameter formula
 * @apiSuccess  {Number}    value       Latest measurement for the sensor
 * @apiSuccess  {Date}      date        Timestamp of the latest datapoint
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "station_id": 114,
 *          "values": [
 *          {
 *              "sensor_id": 642,
 *              "param": "dwutlenek azotu",
 *              "key": "NO2",
 *              "value": 7.3936,
 *              "date": "2020-05-24T21:00:00.000Z"
 *          }]
 *      }
 *
 * @apiError StationNotFound    The requested station does not exist
 * @apiError BadStationID       The ID request parameter is not valid
 * @apiError DataNotRetrieved   Data not available due to server error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *          error: 'The data for station XXX are currently not available',
 *     }
 */
router.get('/api/v1/now/:id', async (req, res) => {
    let {id: station_id} = req.params;
    station_id = Number(station_id);
    if (
        Number.isNaN(station_id) ||
        station_id === null ||
        station_id === undefined
    ) {
        return res
            .status(400)
            .send({message: 'The station id is specified incorrectly!'});
    }
    try {
        const station = await station_data_repo.find_one(station_id);
        if (!station) {
            return res.status(404).send({
                message:
                    `The requested station ${station_id} ` +
                    `is not registered in the database`,
            });
        }

        const current_data = await air_data_repo.get_station_current_data(
            station_id
        );

        res.send(current_data);
    } catch (e) {
        res.status(500).send({
            error: e,
            message:
                `The data for station ${station_id} are currently` +
                ` not available`,
        });
    }
});

/**
 * @api {get}   /api/v1/daily/:id   Request daily averages of air quality
 *                                  parameters of the given station
 * @apiName     GetDailyAverageStationData
 * @apiGroup    Records
 *
 * @apiParam    {Number}    id      ID of the requested station
 * @apiParam    {Date}      date    Day for which the data are requested
 *                                  (query string in the format
 *                                  date=DD-MM-YYYY)
 *
 * @apiSuccess  {Number}    station_id      ID of requested station
 * @apiSuccess  {Date}      day             Daily data timestamp
 * @apiSuccess  {[Object]}  average_values  Averaged daily data
 * @apiSuccess  {Number}    sensor_id       ID of the sensor providing data
 * @apiSuccess  {String}    param           Name of the parameter
 * @apiSuccess  {String}    param           Parameter formula
 * @apiSuccess  {Date}      average_value   Daily-averaged parameter value
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "station_id": 114,
 *          "day": "19-05-2020",
 *          "average_values": [{
 *              "sensor_id": 644,
 *              "param": "ozon",
 *              "key": "O3",
 *              "average_value": 59.3644
 *          }]
 *     }
 *
 * @apiError StationNotFound    The requested station does not exist
 * @apiError BadRequestDate     The requested date is badly formatted
 * @apiError BadStationID       The ID request parameter is not valid
 * @apiError DataNotRetrieved   Data not available due to server error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *          error: 'The data for station XXX are currently not available',
 *     }
 */
router.get('/api/v1/daily/:id', async (req, res) => {
    let {id: station_id} = req.params;
    station_id = Number(station_id);
    if (
        Number.isNaN(station_id) ||
        station_id === null ||
        station_id === undefined
    ) {
        return res
            .status(400)
            .send({message: 'The station id is specified incorrectly!'});
    }
    const {date} = req.query;
    if (!moment.utc(date, 'DD-MM-YYYY').isValid()) {
        return res
            .status(400)
            .send({message: 'The date is specified incorrectly!'});
    }
    let from = moment.utc(date, 'DD-MM-YYYY').toDate();
    const to = moment(from).add(1, 'day').toDate();

    try {
        const station = await station_data_repo.find_one(station_id);
        if (!station) {
            return res.status(404).send({
                message:
                    `The requested station ${station_id} ` +
                    `is not registered in the database`,
            });
        }

        const daily_averages = await air_data_repo.get_station_period_average(
            station_id,
            from,
            to
        );

        from = moment(from).format('DD-MM-YYYY');

        const response = {
            station_id,
            day: from,
            average_values: daily_averages,
        };
        res.send(response);
    } catch (e) {
        res.status(500).send({
            error: e,
            message:
                `The data for ${from} for ` +
                `station ${station_id} are currently not available`,
        });
    }
});

/**
 * @api {get}   /api/v1/period/:id      Request averages of air quality
 *                                      parameters of the given station
 *                                      over specified period
 *
 * @apiName     GetPeriodAverageStationData
 * @apiGroup    Records
 *
 * @apiParam    {Number}    id      ID of the requested station
 * @apiParam    {Date}      date    Start of the requested period
 *                                  (query string in the format
 *                                  from=DD-MM-YYYY) - inclusive
 * @apiParam    {Date}      date    End of the requested period
 *                                  (query string in the format
 *                                  to=DD-MM-YYYY) - inclusive
 *
 * @apiSuccess  {Number}    station_id      ID of requested station
 * @apiSuccess  {Date}      from            Period start timestamp (incl.)
 * @apiSuccess  {Date}      to              Period end timestamp (incl.)
 * @apiSuccess  {[Object]}  average_values  Averaged period data
 * @apiSuccess  {Number}    sensor_id       ID of the sensor providing data
 * @apiSuccess  {String}    param           Name of the parameter
 * @apiSuccess  {String}    param           Parameter formula
 * @apiSuccess  {Date}      average_value   Period-averaged parameter value
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "station_id": 285,
 *          "from": "21-05-2020",
 *          "to": "22-05-2020",
 *          "average_values": [{
 *              "sensor_id": 26316,
 *              "param": "pył zawieszony PM2.5",
 *              "key": "PM2.5",
 *              "average_value": 8.276
 *          }]
 *      }
 *
 * @apiError StationNotFound    The requested station does not exist
 * @apiError BadRequestPeriod   The period endpoints are badly formatted
 * @apiError BadStationID       The ID request parameter is not valid
 * @apiError DataNotRetrieved   Data not available due to server error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *          error: 'The data for station XXX are currently not available',
 *     }
 */
router.get('/api/v1/period/:id', async (req, res) => {
    let {id: station_id} = req.params;
    let {from, to} = req.query;
    station_id = Number(station_id);
    if (
        Number.isNaN(station_id) ||
        station_id === null ||
        station_id === undefined
    ) {
        return res
            .status(400)
            .send({message: 'The station id is specified incorrectly!'});
    }

    from = moment.utc(from, 'DD-MM-YYYY');
    to = moment.utc(to, 'DD-MM-YYYY');
    if (!from.isValid() || !to.isValid() || !to.isAfter(from)) {
        return res.status(400).send({
            message: 'The period endpoints are specified incorrectly!',
        });
    }
    from = moment.utc(from, 'DD-MM-YYYY').toDate();
    to = moment(to).add(1, 'day').toDate();

    try {
        const station = await station_data_repo.find_one(station_id);
        if (!station) {
            return res.status(404).send({
                message:
                    `The requested station ${station_id} ` +
                    ` is not registered in the database`,
            });
        }

        const period_averages = await air_data_repo.get_station_period_average(
            station_id,
            from,
            to
        );

        from = moment(from).format('DD-MM-YYYY');
        to = moment(to).subtract(1, 'day').format('DD-MM-YYYY');

        const response = {
            station_id,
            from,
            to,
            average_values: period_averages,
        };
        res.send(response);
    } catch (e) {
        res.status(500).send({
            error: e,
            message:
                `The data for period between ${from} and ${to}` +
                ` for station ${station_id} are currently not available`,
        });
    }
});

/**
 * This is a simplicisstic 404 route which matches all the remaining
 * requests which were not previously matched and sends back the
 * error message
 */
router.get('*', async (req, res) => {
    res.status(404).send({
        error: "I DON'T KNOW WHAT YOU ARE ASKING FOR",
    });
});

module.exports = router;
