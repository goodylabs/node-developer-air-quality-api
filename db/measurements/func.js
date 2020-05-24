import Measurement from './schema';
import { getMeasurementsByStation } from '../../api/controller';

const getAvg = (values, day) => {
  let i = 0;
  let sum = 0;
  values.forEach((v) => {
    const { date } = v;
    date.setHours(0, 0, 0, 0);
    if (day.getTime() === date.getTime()) {
      if (v.value !== null) {
        sum += v.value;
        i += 1;
      }
    }
  });
  return sum / i;
};

const getAvgFromPeriod = (values, start, end) => {
  let i = 0;
  let sum = 0;
  values.forEach((v) => {
    const { date } = v;
    if (date.getTime() >= start.getTime() && date.getTime() <= end.getTime()) {
      if (v.value !== null) {
        sum += v.value;
        i += 1;
      }
    }
  });
  return sum / i;
};

export const saveMeasures = async (stations) => {
  const ids = stations.map((station) => station.id);
  for (let i = 0; i < ids.length; i++) {
    getMeasurementsByStation(ids[i])
      .then((m) => {
        Measurement.findOneAndUpdate(
          { stationId: ids[i] },
          { stationId: ids[i], measurements: m },
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

export const getAggregatedMeasurements = async (stationId, date) => {
  const m = await Measurement.findOne({ stationId });
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return m.measurements.map((val) => {
    const { key } = val;
    const avg = getAvg(val.values, day);
    return { key, avg };
  });
};

export const getAggregatedMeasurementsFromPeriod = async (stationId, start, end) => {
  const m = await Measurement.findOne({ stationId });
  return m.measurements.map((val) => {
    const { key } = val;
    const avg = getAvgFromPeriod(val.values, new Date(start), new Date(end));
    return { key, avg };
  });
};
