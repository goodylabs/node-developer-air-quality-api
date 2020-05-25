/**
 * Updating the database when it is connected and scheduling jobs
 * for cyclical requests to GIOS API for new air quality data in order
 * to accumulate them in the database. It was decided to make requests
 * for hourly air quality parameters three times per - for the reason that
 * GIOS updates its records in different times throughout the hour and does
 * so in portions, while serving dummy null measurement obects meanwhile,
 * which will be populated with real data later. Repeated calls allow to keep data
 * up to date and provide a simple workaround.
 */
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const config = require('config');
const station_data_repo = require('../repos/station_data_repo');
const air_data_repo = require('../repos/air_data_repo');

// Currently requests are fired off at XX:15, XX:30 and XX:45 -
// three times per hour for air quality data. The stations data are more
// persistent, so they are updated on the daily basis (18:18). The time of
// the operations can be changed in ./config files
const update_records_first_call = config.get('update_records_first_call');
const update_records_second_call = config.get('update_records_second_call');
const update_records_third_call = config.get('update_records_third_call');
const update_stations_call = config.get('update_stations_call');

async function db_update() {
    await station_data_repo.update();
    await air_data_repo.update();
}

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', async () => {
    await db_update();
    schedule.scheduleJob(update_records_first_call, async () => {
        await air_data_repo.update();
    });
    schedule.scheduleJob(update_records_second_call, async () => {
        await air_data_repo.update();
    });
    schedule.scheduleJob(update_records_third_call, async () => {
        await air_data_repo.update();
    });
    schedule.scheduleJob(update_stations_call, async () => {
        await station_data_repo.update();
    });
});
