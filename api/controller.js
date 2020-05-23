import { saveStations } from '../db/stations/func';
import { saveMeasures } from '../db/measurements/func';

const axios = require('axios').default;

const getStations = async () => {
  const response = await axios.get(
    'http://api.gios.gov.pl/pjp-api/rest/station/findAll',
  );
  return response.data;
};

export const getMeasuresByStation = async (stationId) => {
  const response = await axios.get(
    `http://api.gios.gov.pl/pjp-api/rest/station/sensors/${stationId}`,
  );
  const sensors = response.data;
  const promises = [];
  for (let i = 0; i < sensors.length; i++) {
    promises.push(
      axios.get(
        `http://api.gios.gov.pl/pjp-api/rest/data/getData/${sensors[i].id}`,
      ),
    );
  }
  return (await Promise.all(promises)).map((r) => r.data);
};

const updateData = async () => {
  console.log('Starting data update...');
  try {
    const stations = await getStations();
    await saveStations(stations);
    await saveMeasures(stations);
    console.log('Data update complete.');
  } catch (e) {
    console.error(`Error happened during data update: ${e.message}`);
  }
};

export default updateData;
