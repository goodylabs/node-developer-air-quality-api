/**
 * Tests for api/v1/now:id route
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
const api_suffix = 'now/';
const internal_error_message = 'are currently not available';
const message_404 = 'is not registered in the database';
const tested_station = {
    id: 114,
    no2: 4.3241,
    o3: 93.4006,
    sensors: [642, 644],
    keys: ['NO2', 'O3'],
    date: '',
};
const no_data_station_id = 74;

describe('Current air quality API', () => {
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
                    body: {values},
                } = await request(app).get(api_url + api_suffix + id);
                values.should.have.lengthOf(sensors);
            });
        }
        sensors_per_station.map(test_sensor_numbers);

        it('object holding an array with current values', async () => {
            const {body} = await request(app).get(
                api_url + api_suffix + tested_station.id
            );
            body.should.have.a.property('values').that.is.an('array');
        });

        it(
            'only the data from sensors belonging to the station' +
                'for which the measurements are available',
            async () => {
                const {
                    body: {values},
                } = await request(app).get(
                    api_url + api_suffix + tested_station.id
                );
                const sensors = values.map((val) => val.sensor_id);
                sensors.should.have.a.lengthOf(2);
                expect(sensors.sort()).to.eql(tested_station.sensors.sort());
            }
        );

        it('all available air quality parameters for the station', async () => {
            const {body} = await request(app).get(
                api_url + api_suffix + tested_station.id
            );
            const keys = body.values.map((val) => val.key);
            expect(keys.sort()).to.be.eql(tested_station.keys.sort());
        });

        it('correct current data for the station', async () => {
            const {
                body: {values, station_id: id},
            } = await request(app).get(
                api_url + api_suffix + tested_station.id
            );
            expect(id).to.eq(tested_station.id);
            const no2 = values.find(({key}) => key === 'NO2');
            const o3 = values.find(({key}) => key === 'O3');
            expect(no2.value).to.be.eq(tested_station.no2);
            expect(o3.value).to.be.eq(tested_station.o3);
        });

        it('an empty array of values if no data was found', async () => {
            const {body} = await request(app).get(
                api_url + api_suffix + no_data_station_id
            );
            expect(body.values).to.be.an('array').and.have.lengthOf(0);
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
        it('object having an empty array of values', async () => {
            const {body} = await request(app).get(
                api_url + api_suffix + tested_station.id
            );
            body.should.have.a
                .property('values')
                .that.is.an('array')
                .and.has.lengthOf(0);
        });

        it('object containing info about the requested station', async () => {
            const {body} = await request(app).get(
                api_url + api_suffix + tested_station.id
            );
            body.should.have.a
                .property('station_id')
                .that.eqls(tested_station.id);
        });
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
                .get(api_url + api_suffix + 777)
                .expect(404);
        });

        it(
            'specified error message when non-registered station' +
                ' is passed',
            async () => {
                const {body} = await request(app).get(
                    api_url + api_suffix + 777
                );
                expect(body.message.endsWith(message_404)).to.be.true;
            }
        );

        it('400 when station id is badly formatted', async () => {
            await request(app)
                .get(api_url + api_suffix + 'gibberish')
                .expect(400);
        });
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
                .get(api_url + api_suffix + tested_station.id)
                .expect(500);
        });

        it('object with the specified error message', async () => {
            const {body} = await request(app).get(
                api_url + api_suffix + tested_station.id
            );
            expect(body).to.have.property('error');
            expect(body.message.endsWith(internal_error_message)).to.be.true;
        });
    });
});
