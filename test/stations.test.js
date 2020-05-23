import { saveStations } from '../db/stations/func';
import Station from '../db/stations/schema';

require('dotenv').config();

const { expect, beforeAll, afterAll, describe, it } = require('@jest/globals');
const mongoose = require('mongoose');

describe('Testing stations', () => {
  beforeAll(async () => {
    mongoose.connect(process.env.TEST_DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('save stations to db', async () => {
    const insert = [
      {
        id: 114,
        stationName: 'Wrocław - Bartnicza',
        gegrLat: '51.115933',
        gegrLon: '17.141125',
        city: {
          id: 1064,
          name: 'Wrocław',
          commune: {
            communeName: 'Wrocław',
            districtName: 'Wrocław',
            provinceName: 'DOLNOŚLĄSKIE',
          },
        },
        addressStreet: 'ul. Bartnicza',
      },
      {
        id: 117,
        stationName: 'Wrocław - Korzeniowskiego',
        gegrLat: '51.129378',
        gegrLon: '17.029250',
        city: {
          id: 1064,
          name: 'Wrocław',
          commune: {
            communeName: 'Wrocław',
            districtName: 'Wrocław',
            provinceName: 'DOLNOŚLĄSKIE',
          },
        },
        addressStreet: 'ul. Wyb. J.Conrada-Korzeniowskiego 18',
      },
    ];
    saveStations(insert);
    const stations = await Station.find({});
    expect(stations.length).toEqual(insert.length);
  });
});
