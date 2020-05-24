import Station from './schema';

// eslint-disable-next-line import/prefer-default-export
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
