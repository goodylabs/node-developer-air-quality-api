import Station from './schema';
import { getMeasuresByStation } from '../../api/controller';
import Measure from '../measures/schema';

export const saveStations = (stations) => {
  Object.keys(stations).forEach((s) => {
    if (Object.prototype.hasOwnProperty.call(stations, s)) {
      Station.findOneAndUpdate({ id: stations[s].id }, stations[s], {
        upsert: true,
        useFindAndModify: false,
      }).catch((err) => {
        console.log(err.message);
      });
    }
  });
};

export const saveMeasures = async () => {
  const stations = await Station.find({});
  const ids = stations.map((station) => station.id);
  for (let i = 0; i < ids.length; i++) {
    try {
      const m = await getMeasuresByStation(ids[i]);
      Measure.findOneAndUpdate(
        { stationId: ids[i] },
        { stationId: ids[i], measures: m },
        {
          upsert: true,
          useFindAndModify: false,
        },
      ).catch((err) => {
        console.log(err.message);
      });
    } catch (e) {
      console.log(e.message);
    }
  }
  console.log('Measure update complete');
};
