const mongoose = require('mongoose');
const config = require('../config/app');
const stations = require('../services/stations.service');
const Station = require('../models/Station');
const Measurement = require('../models/Measurement');

require('dotenv').config();

describe('Stations tests', () => {
  beforeAll(async () => {
    mongoose.connect(config.mongodbTestUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    Station.updateOne({ id: 1 }, {
      id: 1,
      stationName: 'test',
      gegrLat: '50.972167',
      gegrLon: '50.972167',
      city: {
        id: 1,
        name: 'test2',
        commune: {
          communeName: 'a',
          districtName: 'b',
          provinceName: 'c',
        },
      },
      addressStreet: 'd',
    }, {
      upsert: true,
    }, (err, _) => {
      if (err) console.error('Failed to save station with id 1');
    });

    Measurement.updateOne({
      stationId: 1,
      type: 'PM10',
      date: new Date('2020-05-25T03:00:00Z'),
    }, {
      stationId: 1,
      type: 'PM10',
      date: new Date('2020-05-25T03:00:00Z'),
      value: 10,
    }, {
      upsert: true,
    }, (err, _) => {
      if (err) console.error(`Failed to save measurement: ${err}`);
    });

    Measurement.updateOne({
      stationId: 1,
      type: 'PM10',
      date: new Date('2020-05-25T04:00:00Z'),
    }, {
      stationId: 1,
      type: 'PM10',
      date: new Date('2020-05-25T04:00:00Z'),
      value: 20,
    }, {
      upsert: true,
    }, (err, _) => {
      if (err) console.error(`Failed to save measurement: ${err}`);
    });

    Measurement.updateOne({
      stationId: 1,
      type: 'NO2',
      date: new Date('2020-05-25T04:00:00Z'),
    }, {
      stationId: 1,
      type: 'NO2',
      date: new Date('2020-05-25T04:00:00Z'),
      value: 5,
    }, {
      upsert: true,
    }, (err, _) => {
      if (err) console.error(`Failed to save measurement: ${err}`);
    });

    await new Promise((r) => setTimeout(r, 1000));
  });

  afterAll(async (done) => {
    done();
  });

  describe('listAll', () => {
    it('should return list of stations', async () => {
      const result = await stations.listAll();
      expect(result.length).toEqual(1);
    });
  });

  describe('getLatestData', () => {
    it('should return latest data', async () => {
      const result = await stations.getLatestData(1);
      expect(result[0].type).toEqual('PM10');
      expect(result[0].value).toEqual(20);
      expect(result[1].type).toEqual('NO2');
      expect(result[1].value).toEqual(5);
    });
  });

  describe('getMeasurementsData', () => {
    it('should return data in date range', async () => {
      const result = await stations.getMeasurementsData(1, new Date('2020-01-25T07:00:00Z'), new Date('2020-06-25T03:01:00Z'));
      console.log(result);
      expect(result[1].type).toEqual('NO2');
      expect(result[1].value).toEqual(5);
      expect(result[0].type).toEqual('PM10');
      expect(result[0].value).toEqual(15);
    });
  });
});
