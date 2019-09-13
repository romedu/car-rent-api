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
			const { insertId: userId } = JSON.parse(JSON.stringify(result));
			return res.status(201).json({ token: await getValidJwt(userId) });
		});
	} catch (error) {
		return next(error);
	}
};

const getValidJwt = async userId => await jwt.sign({ userId }, SECRET);

module.exports = exports;
