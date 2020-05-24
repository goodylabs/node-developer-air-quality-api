import { saveStations } from '../db/stations/func';
import { saveMeasures } from '../db/measurements/func';
import { getStations } from './controller';

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
