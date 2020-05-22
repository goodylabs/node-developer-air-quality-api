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
        console.error(err.message);
      });
    }
  });
};

export const saveMeasures = async () => {
  const stations = await Station.find({});
  const ids = stations.map((station) => station.id);
  for (let i = 0; i < ids.length; i++) {
    getMeasuresByStation(ids[i])
      .then((m) => {
        Measure.findOneAndUpdate(
          { stationId: ids[i] },
          { stationId: ids[i], measures: m },
          {
            upsert: true,
            useFindAndModify: false,
          },
        ).catch((err) => {
          console.error(err.message);
        });
      })
      .catch((err) => {
        console.error(err.message);
      });
  }
};
