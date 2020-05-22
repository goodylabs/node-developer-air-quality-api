import Measure from './schema';

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

export const getAggregatedMeasures = async (stationId, date) => {
  const m = await Measure.findOne({ stationId });
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return m.measures.map((val) => {
    const { key } = val;
    const avg = getAvg(val.values, day);
    return { key, avg };
  });
};

export const getAggregatedMeasuresFromPeriod = async (
  stationId,
  start,
  end,
) => {
  const m = await Measure.findOne({ stationId });
  return m.measures.map((val) => {
    const { key } = val;
    const avg = getAvgFromPeriod(val.values, new Date(start), new Date(end));
    return { key, avg };
  });
};
