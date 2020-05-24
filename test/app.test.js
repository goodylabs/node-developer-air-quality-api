import { saveStations } from '../db/stations/func';
import Station from '../db/stations/schema';
import { testMeasurements, testStations } from './data';
import Measurement from '../db/measurements/schema';
import {
  getAggregatedMeasurements,
  getAggregatedMeasurementsFromPeriod,
} from '../db/measurements/func';

require('dotenv').config();

const { expect, beforeAll, afterAll, describe } = require('@jest/globals');
const mongoose = require('mongoose');

describe('App test suite', () => {
  beforeAll(async () => {
    mongoose.connect(process.env.TEST_DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    saveStations(testStations);
    Measurement.findOneAndUpdate(
      { stationId: 109 },
      { stationId: 109, measures: testMeasurements },
      { upsert: true, useFindAndModify: false },
    ).catch((err) => {
      console.error(err.message);
    });
    // wait for db to init before firing tests
    await new Promise((r) => setTimeout(r, 500));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('read stations from db', async () => {
    const stations = await Station.find({});
    expect(stations.length).toEqual(testStations.length);
    expect(stations[0].id).toEqual(114);
    expect(stations[1].stationName).toEqual('Wrocław - Korzeniowskiego');
  });

  test('read measurements from db', async () => {
    const measurement = await Measurement.findOne({ stationId: 109 });
    expect(measurement.stationId).toEqual(109);
    expect(measurement.measures.length).toEqual(6);
  });

  test('read aggregated measurements', async () => {
    const agg = await getAggregatedMeasurements(109, '2020-05-24T00:00:00.000+00:00');
    expect(agg.length).toEqual(6);
    expect(agg[0].key).toEqual('C6H6');
    expect(agg[0].avg).toEqual(0.11136375);
    expect(agg[1].key).toEqual('CO');
    expect(agg[1].avg).toEqual(211.9766875);
    expect(agg[2].key).toEqual('NO2');
    expect(agg[2].avg).toEqual(1.99309375);
    expect(agg[3].key).toEqual('O3');
    expect(agg[3].avg).toEqual(71.80830625000002);
    expect(agg[4].key).toEqual('PM10');
    expect(agg[4].avg).toEqual(13.291866);
    expect(agg[5].key).toEqual('SO2');
    expect(agg[5].avg).toEqual(2.38051625);
  });

  test('read aggregated measurements from a period', async () => {
    const agg = await getAggregatedMeasurementsFromPeriod(
      109,
      '2020-05-24T00:00:00.000+00:00',
      '2020-05-24T12:00:00.000+00:00',
    );
    expect(agg.length).toEqual(6);
    expect(agg[0].key).toEqual('C6H6');
    expect(agg[0].avg).toEqual(0.10761923076923076);
    expect(agg[1].key).toEqual('CO');
    expect(agg[1].avg).toEqual(212.02338461538466);
    expect(agg[2].key).toEqual('NO2');
    expect(agg[2].avg).toEqual(2.052965384615385);
    expect(agg[3].key).toEqual('O3');
    expect(agg[3].avg).toEqual(70.72752307692309);
    expect(agg[4].key).toEqual('PM10');
    expect(agg[4].avg).toEqual(13.469676153846153);
    expect(agg[5].key).toEqual('SO2');
    expect(agg[5].avg).toEqual(2.3522253846153847);
  });
});
