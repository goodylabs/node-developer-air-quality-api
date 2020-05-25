const Station = require('../models/Station');

const listAll = () => new Promise((resolve, reject) => {
  Station.find().then((result) => {
    const entries = result.map((entry) => entry.toJSON());
    resolve(entries);
  }).catch((err) => {
    reject(err);
  });
});

const findById = (id) => new Promise((resolve, reject) => {
  Station.findOne({ id }).then((result) => {
    resolve(result.toJSON());
  }).catch((err) => {
    reject(err);
  });
});

module.exports = {
  listAll,
  findById,
};
