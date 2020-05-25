import mongodb from "mongodb";
import {
	fetchAllStations,
	fetchStationMeasurements,
	compensateTimeDifference,
} from "./processing.js";
const url = "mongodb://localhost:27017";
const databaseName = "weather-api-database";
const collectionName = "stations";
let db;

const openConnection = (callback) => {
	mongodb.MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(err, client) => {
			if (err) return console.log(err);
			db = client.db(databaseName);
			console.log(`Connected MongoDB: ${url}`);
			console.log(`Database: ${databaseName}`);
			callback();
		}
	);
};

const setupDatabase = async () => {
	console.log("Database setup started at " + new Date());

	let stations = await fetchAllStations();
	let query = [];

	query = query.concat(constructDocumentCreationQuery(stations));

	let result = await db.collection(collectionName).bulkWrite(query);

	query = [];

	let databaseStations = await db
		.collection(collectionName)
		.find(
			{},
			{
				sensors: 1,
			}
		)
		.toArray();

	for (let station of databaseStations) {
		let sensors = await fetchStationMeasurements(station.stationId);

		let databaseSensors = station.sensors;

		for (let sensor of sensors) {
			query = query.concat(
				constructSensorCreationQuery(sensor, station, databaseSensors)
			);
		}
		logProgress(databaseStations.indexOf(station) + 1, databaseStations.length);
	}
	result = await db.collection(collectionName).bulkWrite(query);
	console.log("\n");
	console.log(result);
	console.log("Database setup complete at " + new Date());
};

const updateDatabase = async () => {
	console.log("Database update started at " + new Date());
	let stations = await fetchAllStations();
	let query = [];
	for (let station of stations) {
		let sensors = await fetchStationMeasurements(station.id);
		if (sensors.length !== 0) {
			for (let sensor of sensors) {
				if (sensor.values.length !== 0) {
					sensor.values[0].date = compensateTimeDifference(
						sensor.values[0].date
					);
					query.push({
						updateOne: {
							filter: {
								$and: [
									{ stationId: station.id },
									{ "sensors.key": sensor.key },
								],
							},
							update: {
								$pull: {
									"sensors.$.values": {
										date: sensor.values[0].date,
									},
								},
							},
						},
					});
					query.push({
						updateOne: {
							filter: {
								$and: [
									{ stationId: station.id },
									{ "sensors.key": sensor.key },
								],
							},
							update: { $push: { "sensors.$.values": sensor.values[0] } },
						},
					});
				}
			}
		}
		logProgress(stations.indexOf(station) + 1, stations.length);
	}
	let result = await db.collection(collectionName).bulkWrite(query);
	console.log("\n");
	console.log(result);
	console.log("Database update complete at " + new Date());
};

const findAverageMeasurementForDay = async (stationId, day, database) => {
	day = compensateTimeDifference(day);
	day.setUTCHours(0, 0, 0, 0);
	let nextDay = new Date();
	nextDay.setUTCHours(0, 0, 0, 0);
	nextDay.setDate(day.getDate() + 1);
	nextDay.setUTCHours(0, 0, 0, 0);
	return database
		.collection(collectionName)
		.aggregate([
			{ $match: { stationId: +stationId } },
			{ $unwind: "$sensors" },
			{ $unwind: "$sensors.values" },
			{ $match: { "sensors.values.date": { $gte: day, $lt: nextDay } } },
			{
				$group: {
					_id: "$sensors.key",
					average: { $avg: "$sensors.values.value" },
				},
			},
			{
				$project: {
					stationId: { $literal: stationId },
					date: { $literal: day },
					_id: 1,
					average: { $round: ["$average", 2] },
				},
			},
		])
		.toArray();
};

const findAverageMeasurementFromTo = async (stationId, from, to, database) => {
	from = compensateTimeDifference(from);
	from.setUTCHours(0, 0, 0, 0);
	to = compensateTimeDifference(to);
	to.setUTCHours(0, 0, 0, 0);
	return database
		.collection(collectionName)
		.aggregate([
			{ $match: { stationId: +stationId } },
			{ $unwind: "$sensors" },
			{ $unwind: "$sensors.values" },
			{ $match: { "sensors.values.date": { $gte: from, $lt: to } } },
			{
				$group: {
					_id: "$sensors.key",
					average: { $avg: "$sensors.values.value" },
				},
			},
			{
				$project: {
					stationId: { $literal: stationId },
					from: { $literal: from },
					to: { $literal: to },
					_id: 1,
					average: { $round: ["$average", 2] },
				},
			},
		])
		.toArray();
};

const constructDocumentCreationQuery = (stations) => {
	let query = [];
	for (let station of stations) {
		query.push({
			updateOne: {
				filter: { stationId: station.id },
				update: { $setOnInsert: { stationId: station.id, sensors: [] } },
				upsert: true,
			},
		});
	}
	return query;
};

const constructSensorCreationQuery = (sensor, station, databaseSensors) => {
	let query = [];
	let databaseSensor = null;
	for (let i = 0; i < databaseSensors.length; i++) {
		if (databaseSensors[i].key === sensor.key) {
			databaseSensor = databaseSensors[i];
			break;
		} else {
			continue;
		}
	}
	if (databaseSensor === null) {
		query.push({
			updateOne: {
				filter: { stationId: station.stationId },
				update: { $push: { sensors: { key: sensor.key, values: [] } } },
			},
		});
	}

	sensor.values.forEach((measurement) => {
		measurement.date = compensateTimeDifference(measurement.date);
	});

	query.push({
		updateOne: {
			filter: {
				$and: [{ stationId: station.stationId }, { "sensors.key": sensor.key }],
			},
			update: { $addToSet: { "sensors.$.values": { $each: sensor.values } } },
		},
	});

	return query;
};

const logProgress = (current, total) => {
	process.stdout.write("Progress: " + "[" + current + "/" + total + "]" + "\r");
};

export {
	openConnection,
	findAverageMeasurementForDay,
	findAverageMeasurementFromTo,
	setupDatabase,
	updateDatabase,
	db,
};
