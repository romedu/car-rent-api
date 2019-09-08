const dbPool = require("../model");

// Checks if the currentUser is the one who actually rented the car
exports.checkIfOwner = (req, res, next) => {
	const { id: rentId } = req.params,
		rentQuery = `SELECT client_id AS clientId FROM rent WHERE id = ${rentId}`;

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

module.exports = exports;
