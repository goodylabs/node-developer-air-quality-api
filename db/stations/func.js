import Station from './schema';

export const saveStations = (stations) => {
  for (const s in stations) {
    new Station(stations[s]).save().catch((err) => {
      console.log(err.message);
    });
  }
};
