const stations = require('../services/stations.service');

const all = async (req, res, next) => {
  try {
    const result = await stations.listAll();
    res.send(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  all,
};
