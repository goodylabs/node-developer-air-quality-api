/**
 * Tests for /api/v1/stations route
 */
const mongoose = require('mongoose');
const config = require('config');
const request = require('supertest');
const chai = require('chai');
const app = require('../src/app');
const db = require('./fixtures/db');
const dbpath = config.get('dbpath');
const stations_data = require('./mock_data/stations_data');
const expect = chai.expect;
chai.should();

const api_url = '/api/v1/';

mongoose.models = {};
mongoose.modelSchemas = {};

describe('Stations list API ', () => {
    const api_suffix = 'stations';
    describe('with station data in the database responds with', async () => {
        const ids = [
            stations_data.real[0].station_id,
            stations_data.real[1].station_id,
            stations_data.real[2].station_id,
        ];

        before(async () => {
            await db.seed();
        });

        after(async () => {
            await db.clear();
        });

        it('200 code when request succeeds', async () => {
            await request(app)
                .get(api_url + api_suffix)
                .expect(200);
        });

        it('list of length 4 (number of stations in the mock database)', async () => {
            const {body} = await request(app).get(api_url + api_suffix);
            body.should.have.lengthOf(4);
        });

        it(
            'array of objects with properties city, address, ' +
                'longitude, latitude, name, station_id',
            async () => {
                const {body} = await request(app).get(api_url + api_suffix);
                body.should.be.an('array');
                body[0].should.have.property('city');
                body[0].should.have.property('address');
                body[0].should.have.property('longitude');
                body[0].should.have.property('latitude');
                body[0].should.have.property('name');
                body[0].should.have.property('station_id');
            }
        );

        it('all existing stations data', async () => {
            const {body} = await request(app).get(api_url + api_suffix);
            expect(ids.includes(body[0].station_id)).to.be.true;
            expect(ids.includes(body[1].station_id)).to.be.true;
            expect(ids.includes(body[2].station_id)).to.be.true;
        });

        it('no non-existent stations data', async () => {
            const {body} = await request(app).get(api_url + api_suffix);
            let fetched_ids = body.map((station) => station.station_id);
            expect(fetched_ids.includes(stations_data.fake_station.station_id))
                .to.be.false;
        });
    });

    describe('without station data in the database responds with', async () => {
        before(async () => {
            await db.clear();
        });

        it('an array of length 0 (number of stations in the empty database)', async () => {
            const {body} = await request(app).get(api_url + api_suffix);
            body.should.be.not.undefined;
            body.should.be.not.null;
            body.should.have.lengthOf(0);
        });
    });

    describe('handles internal server errors with', () => {
        const error_message =
            'The list of stations is currently not available!';
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
                .get(api_url + api_suffix)
                .expect(500);
        });

        it('object with the specified error message', async () => {
            const {body} = await request(app).get(api_url + api_suffix);
            expect(body).to.have.property('error');
            expect(body.error).eql(error_message);
        });
    });
});
