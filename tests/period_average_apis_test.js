/**
 * Tests for the /api/v1/daily/:id and /api/v1/period/:id routes.
 * This file defines and calls the function which generates and runs
 * a separate suite of tests for each of these routes - most of the
 * tests we apply to each route is similar, since they have
 * much in common (after all, daily request internally is processed
 * as request for the data from period 00:00AM to 00:00AM next day).
 * Yet they consume different parameters from api calls, and some tests
 * (particularly, data checking) need to be different.
 */
const mongoose = require('mongoose');
const config = require('config');
const request = require('supertest');
const chai = require('chai');
const app = require('../src/app');
const db = require('./fixtures/db');
const dbpath = config.get('dbpath');
const expect = chai.expect;
chai.should();

const api_url = '/api/v1/';

mongoose.models = {};
mongoose.modelSchemas = {};

const daily_api_test_config = {
    description: 'Daily',
    api_suffix: 'daily/',
    query_date: '?date=19-05-2020',
    query_date_no_data: '?date=14-05-2020',
    tested_station: {
        id: 114,
        no2: 12.07187,
        o3: 77.73563,
        sensors: [642, 644],
        keys: ['NO2', 'O3'],
    },
    date: '19-05-2020',
    date_error_message: 'The date is specified incorrectly!',
    internal_error_message: 'are currently not available',
    message_404: 'is not registered in the database',
};

const period_api_test_config = {
    description: 'Period',
    api_suffix: 'period/',
    query_date: '?from=18-05-2020&to=20-05-2020',
    query_date_no_data: '?from=12-05-2020&to=14-05-2020',
    tested_station: {
        id: 114,
        no2: 11.02788,
        o3: 76.32153,
        sensors: [642, 644],
        keys: ['NO2', 'O3'],
    },
    from: '18-05-2020',
    to: '20-05-2020',
    date_error_message: 'The period endpoints are specified incorrectly!',
    internal_error_message: 'are currently not available',
    message_404: 'is not registered in the database',
};

/**
 * Generates the tests for API routes retrieving air quality data
 * averaged over some period (daily or more)
 * @param {Object} param0   Object with test config information
 */
function test_station_period_api({
    description,
    api_suffix,
    tested_station,
    query_date,
    date,
    from,
    to,
    query_date_no_data,
    date_error_message,
    internal_error_message,
    message_404,
}) {
    describe(description + " air quality parameters' averages API", () => {
        describe('with sensor records in the database responds with ', () => {
            before(async () => {
                await db.clear();
                await db.seed();
            });
            after(async () => {
                await db.clear();
            });

            const sensors_per_station = [
                {id: 114, sensors: 2},
                {id: 117, sensors: 7},
                {id: 129, sensors: 3},
            ];
            function test_sensor_numbers({id, sensors}) {
                it(`data for ${sensors} sensors for station ${id}`, async () => {
                    const {
                        body: {average_values},
                    } = await request(app).get(
                        api_url + api_suffix + id + query_date
                    );
                    average_values.should.have.lengthOf(sensors);
                });
            }
            sensors_per_station.map(test_sensor_numbers);

            it('object holding an array with average values', async () => {
                const {body} = await request(app).get(
                    api_url + api_suffix + tested_station.id + query_date
                );
                body.should.have.a
                    .property('average_values')
                    .that.is.an('array');
            });

            it(
                'only the data from sensors belonging to the station' +
                    'for which the measurements are available',
                async () => {
                    const {
                        body: {average_values: vals},
                    } = await request(app).get(
                        api_url + api_suffix + tested_station.id + query_date
                    );
                    const sensors = vals.map((val) => val.sensor_id);
                    sensors.should.have.a.lengthOf(2);
                    expect(sensors.sort()).to.eql(
                        tested_station.sensors.sort()
                    );
                }
            );

            it('all available air quality parameters for the station', async () => {
                const {body} = await request(app).get(
                    api_url + api_suffix + tested_station.id + query_date
                );
                const keys = body.average_values.map((val) => val.key);
                expect(keys.sort()).to.be.eql(tested_station.keys.sort());
            });

            it('correctly calculated average values for the station', async () => {
                const {
                    body: {average_values: vals, station_id: id},
                } = await request(app).get(
                    api_url + api_suffix + tested_station.id + query_date
                );
                expect(id).to.eq(tested_station.id);
                const no2 = vals.find(({key}) => key === 'NO2');
                const o3 = vals.find(({key}) => key === 'O3');
                expect(no2.average_value).to.be.eq(tested_station.no2);
                expect(o3.average_value).to.be.eq(tested_station.o3);
            });

            it('empty array of averages if no data was found', async () => {
                const {body} = await request(app).get(
                    api_url +
                        api_suffix +
                        tested_station.id +
                        query_date_no_data
                );
                expect(body.average_values)
                    .to.be.an('array')
                    .and.have.lengthOf(0);
            });
        });

        describe('without sensor records in the database responds with', () => {
            before(async () => {
                await db.clear();
                await db.seed_stations();
            });

            after(async () => {
                await db.clear();
            });
            it('object having an empty array of the average values', async () => {
                const {body} = await request(app).get(
                    api_url + api_suffix + tested_station.id + query_date
                );
                body.should.have.a
                    .property('average_values')
                    .that.is.an('array')
                    .and.has.lengthOf(0);
            });

            if (date) {
                it(
                    'object containing info about requested station ' +
                        ' and day',
                    async () => {
                        const {body} = await request(app).get(
                            api_url +
                                api_suffix +
                                tested_station.id +
                                query_date
                        );
                        body.should.have.a
                            .property('station_id')
                            .that.eqls(tested_station.id);
                        body.should.have.a.property('day').that.eqls(date);
                    }
                );
            } else {
                it(
                    'object containing info about requested station and ' +
                        'period endpoints',
                    async () => {
                        const {body} = await request(app).get(
                            api_url +
                                api_suffix +
                                tested_station.id +
                                query_date
                        );
                        body.should.have.a
                            .property('station_id')
                            .that.eqls(tested_station.id);
                        body.should.have.a.property('from').that.eqls(from);
                        body.should.have.a.property('to').that.eqls(to);
                    }
                );
            }
        });

        describe('handles request errors with ', () => {
            before(async () => {
                await db.clear();
                await db.seed();
            });
            after(async () => {
                await db.clear();
            });

            it('404 when non-registered station is passed', async () => {
                await request(app)
                    .get(api_url + api_suffix + 777 + query_date)
                    .expect(404);
            });

            it(
                'specified error message when non-registered station' +
                    ' is passed',
                async () => {
                    const {body} = await request(app).get(
                        api_url + api_suffix + 777 + query_date
                    );
                    expect(body.message.endsWith(message_404)).to.be.true;
                }
            );

            it('400 when station id is badly formatted', async () => {
                await request(app)
                    .get(api_url + api_suffix + 'gibberish' + query_date)
                    .expect(400);
            });

            it('400 when no date is passed', async () => {
                await request(app)
                    .get(api_url + api_suffix + tested_station.id)
                    .expect(400);
            });

            it('specified error message when no date is passed', async () => {
                const {body} = await request(app).get(
                    api_url + api_suffix + tested_station.id
                );
                body.message.should.eql(date_error_message);
            });

            if (date) {
                it('400 when badly formatted date is passed', async () => {
                    await request(app)
                        .get(
                            api_url +
                                api_suffix +
                                tested_station.id +
                                '?date=gibberish'
                        )
                        .expect(400);
                    await request(app)
                        .get(
                            api_url +
                                api_suffix +
                                tested_station.id +
                                '?date=33-33-3333'
                        )
                        .expect(400);
                });

                it(
                    'specified error message when badly formatted date' +
                        ' is passed',
                    async () => {
                        async () => {
                            const {body} = await request(app).get(
                                api_url +
                                    api_suffix +
                                    tested_station.id +
                                    '?date=gibberish'
                            );
                            body.message.should.eql(date_error_message);
                        };
                    }
                );
            } else {
                it('400 when badly formatted date is passed', async () => {
                    await request(app)
                        .get(
                            api_url +
                                api_suffix +
                                tested_station.id +
                                '?from=gibberish&to=20-05-2020'
                        )
                        .expect(400);
                    await request(app)
                        .get(
                            api_url +
                                api_suffix +
                                tested_station.id +
                                '?from=18-05-2020&to=33-33-3333'
                        )
                        .expect(400);
                });

                it(
                    'specified error message when badly formatted' +
                        ' date is passed',
                    async () => {
                        async () => {
                            const {body} = await request(app).get(
                                api_url +
                                    api_suffix +
                                    tested_station.id +
                                    '?date=gibberish'
                            );
                            body.message.should.eql(date_error_message);
                        };
                    }
                );
            }

            if (!date) {
                it('400 when only one endpoint is passed', async () => {
                    await request(app)
                        .get(
                            api_url +
                                api_suffix +
                                tested_station.id +
                                '?to=20-05-2020'
                        )
                        .expect(400);
                });

                it(
                    'specified error message when only ' +
                        'one endpoint is passed',
                    async () => {
                        const {body} = await request(app).get(
                            api_url +
                                api_suffix +
                                tested_station.id +
                                '?from=18-05-2020'
                        );
                        body.message.should.eql(date_error_message);
                    }
                );
            }
        });

        describe('handles internal server errors with ', () => {
            before(async () => {
                await mongoose.disconnect();
            });

            after(async () => {
                await mongoose.connect(dbpath, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true,
                    useFindAndModify: false,
                });
            });

            it('500 response', async () => {
                await request(app)
                    .get(api_url + api_suffix + tested_station.id + query_date)
                    .expect(500);
            });

            it('object with the specified error message', async () => {
                const {body} = await request(app).get(
                    api_url + api_suffix + tested_station.id + query_date
                );
                expect(body).to.have.property('error');
                expect(body.message.endsWith(internal_error_message)).to.be
                    .true;
            });
        });
    });
}

test_station_period_api(daily_api_test_config);
test_station_period_api(period_api_test_config);
