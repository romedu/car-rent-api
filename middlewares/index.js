const jwt = require("jsonwebtoken"),
	{ SECRET } = process.env;

// Checks if a valid token was passed within the request headers.
// If valid, set the currentUserId to the req.locals object
exports.checkIfToken = async (req, res, next) => {
	try {
		const token = req.get("Authorization"),
			{ userId: currentUserId } = await jwt.verify(token, SECRET);

		req.locals = { currentUserId };
		return next();
	} catch (error) {
		next(error);
	}
};

module.exports = exports;
