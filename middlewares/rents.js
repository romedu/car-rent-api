const dbPool = require("../model");

// Checks if the currentUser is the one who actually rented the car
exports.checkIfOwner = (req, res, next) => {
	const { id: rentId } = req.params,
		rentQuery = `SELECT client_id AS clientId FROM rent WHERE id = "${rentId}"`;

	dbPool.query(rentQuery, (error, rentResult) => {
		if (error) return next(error);
		const { currentUserId } = req.locals,
			{ clientId } = JSON.parse(JSON.stringify(rentResult))[0];

		if (clientId === currentUserId) next();
		else {
			error = new Error("Unauthorized");
			return next(error);
		}
	});
};

// Finds the current vehicle based on the body's vehicle id and pass its data in the req.locals object
exports.getCurrentVehicle = (req, res, next) => {
	const { vehicleId } = req.body,
		vehicleQuery = `(SELECT id, rent_price AS rentPrice, available, rents FROM vehicle WHERE vehicle.id = "${vehicleId}")`;

	dbPool.query(vehicleQuery, (error, result) => {
		if (error) return next(error);
		const vehicleData = JSON.parse(JSON.stringify(result))[0];
		// If no vehicle was found with the passed id send an error
		if (!vehicleData) {
			error = new Error("Vehicle not found");
			return next(error);
		}
		req.locals.currentVehicle = { ...vehicleData };
		next();
	});
};

// Finds the rented vehicle
exports.getRentedVehicle = (req, res, next) => {
	const { id: rentId } = req.params,
		rentVehicleQuery = `
            SELECT vehicle.id, vehicle.rent_price AS rentPrice, vehicle.available, vehicle.rents
            FROM rent
            INNER JOIN vehicle
            ON vehicle.id = rent.vehicle_id
            WHERE rent.id = "${rentId}"
         `;

	dbPool.query(rentVehicleQuery, (error, vehicleResult) => {
		if (error) return next(error);
		const vehicleData = JSON.parse(JSON.stringify(vehicleResult))[0];
		req.locals.currentVehicle = { ...vehicleData };
		return next();
	});
};

// Checks if the vehicle is available for rent
exports.checkVehicleAvailability = (req, res, next) => {
	const { available } = req.locals.currentVehicle;
	if (available) return next();
	else {
		const error = new Error("Vehicle is currently unavailable");
		return next(error);
	}
};

// Checks if the vehicle is not available
exports.checkVehicleUnavailability = (req, res, next) => {
	const { available } = req.locals.currentVehicle;
	if (!available) return next();
	else {
		const error = new Error("Vehicle must be rented first");
		return next(error);
	}
};

// Checks if the rented vehicle was inspected
exports.checkIfInspected = (req, res, next) => {
	const { id: rentId } = req.params,
		inspectionQuery = `SELECT COUNT(*) as rentCount FROM inspection WHERE rent_id = "${rentId}"`;

	dbPool.query(inspectionQuery, (error, countResult) => {
		if (error) return next(error);
		const { rentCount } = JSON.parse(JSON.stringify(countResult));
		if (rentCount) return next();
		else {
			error = new Error("Vehicle must be inspected first");
			return next(error);
		}
	});
};

module.exports = exports;
