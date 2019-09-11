const dbPool = require("../model");

// Finds the current rent based on the req.body's rentId property
exports.getCurrentRent = (req, res, next) => {
	const { rentId } = req.body,
		currentRentQuery = `
            SELECT client_id AS renterId, returned_at AS returnedAt
            FROM rent WHERE id = "${rentId}";
         `;

	dbPool.query(currentRentQuery, (error, rentResult) => {
		if (error) return next(error);
		const rentData = JSON.parse(JSON.stringify(rentResult))[0];
		// If no rent was found with the passed id send an error
		if (!rentData) {
			error = new Error("Rent not found");
			return next(error);
		}
		req.locals.currentRent = { ...rentData };
		next();
	});
};

// Check if the one inspecting the vehicle is the one who rented it
exports.checkIfIsRenter = (req, res, next) => {
	const { currentRent, currentUserId } = req.locals;
	if (currentRent.renterId === currentUserId) return next();
	else {
		const error = new Error("Unauthorized");
		return next(error);
	}
};

// Check if the vehicle is currently rented
exports.checkIfRented = (req, res, next) => {
	const { currentRent } = req.locals;

	// If the rent was already returned send an error
	if (currentRent.returnedAt) {
		const error = new Error("Rent was already returned");
		return next(error);
	}
	return next();
};

exports.checkIfNotInspected = (req, res, next) => {
	const { rentId } = req.body,
		rentCountQuery = `SELECT COUNT(*) as rentCount FROM inspection WHERE rent_id = "${rentId}";`;

	dbPool.query(rentCountQuery, (error, rentCountResult) => {
		if (error) return next(error);
		const { rentCount } = JSON.parse(JSON.stringify(rentCountResult));
		// If the count is greater than 0 it was inspected already
		if (!rentCount) return next();
		else {
			error = new Error("Vehicle was inspected already");
			return next(error);
		}
	});
};

module.exports = exports;
