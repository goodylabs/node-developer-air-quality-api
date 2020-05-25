const Station = require('../models/Station');

const listAll = () => new Promise((resolve, reject) => {
  Station.find().then((result) => {
    const entries = result.map((entry) => entry.toJSON());
    resolve(entries);
  }).catch((err) => {
    reject(err);
  });
});

module.exports = {
  listAll,
};
