const jwt = require("jsonwebtoken"),
	{ SECRET } = process.env,
	{ createError } = require("../utils");

// Checks if a valid token was passed within the request headers.
// If valid, set the currentUserId to the req.locals object
exports.checkIfToken = async (req, res, next) => {
	try {
		const token = req.get("Authorization");

		if (!token) throw createError(401);
		else {
			const { userId: currentUserId } = await jwt.verify(token, SECRET);
			req.locals = { currentUserId };
			return next();
		}
	} catch (error) {
		if (!error.status) error = createError(400, "Invalid token");
		next(error);
	}
};

module.exports = exports;
