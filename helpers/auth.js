const bcrypt = require("bcryptjs"),
	jwt = require("jsonwebtoken"),
	dbPool = require("../model"),
	{ createError } = require("../utils"),
	{ SECRET } = process.env;

exports.login = (req, res, next) => {
	const { username, password } = req.body,
		userQuery = `SELECT id, password FROM client WHERE username="${username}"`;

	dbPool.query(userQuery, async (error, results) => {
		try {
			if (error) throw error;
			const userData = JSON.parse(JSON.stringify(results))[0];

			if (userData) {
				const { password: hashedPassword, id: userId } = userData,
					passwordValidity = await bcrypt.compare(
						password,
						hashedPassword
					);

				if (passwordValidity) {
					const token = await getValidJwt(userId);
					return res.status(200).json({ token });
				}
			}

			throw createError(422, "Invalid Username/Password");
		} catch (error) {
			next(error);
		}
	});
};

exports.register = async (req, res, next) => {
	try {
		const {
				username,
				password,
				name,
				nationalId,
				cardNo,
				isJuridic
			} = req.body,
			passwordHash = await bcrypt.hash(password, 8),
			query = `
            INSERT INTO client(username, password, name, national_id, card_no, is_juridic)
            VALUES ("${username}", "${passwordHash}", "${name}", "${nationalId}", "${cardNo}", ${isJuridic});
         `;

		dbPool.query(query, async (error, result) => {
			if (error) return next(error);
			const { insertId: userId } = JSON.parse(JSON.stringify(result)),
				token = await getValidJwt(userId);

			return res.status(201).json({ token });
		});
	} catch (error) {
		return next(error);
	}
};

exports.renewToken = async (req, res, next) => {
	const { currentUserId } = req.locals,
		token = await getValidJwt(currentUserId);

	return res.status(201).json({ token });
};

// The expiresIn param accepts the number of seconds in which the token will expire, defaulting at 2 hours
const getValidJwt = async (userId, expiresIn = 60 * 120) => {
	// The token will expire 2 hours after its creation
	const token = await jwt.sign({ userId }, SECRET, { expiresIn }),
		tokenExp = new Date().valueOf() + 1000 * expiresIn; // Represents in milliseconds the time when the token will expire

	return { token, tokenExp };
};

module.exports = exports;
