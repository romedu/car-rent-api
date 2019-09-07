const router = require("express").Router(),
	bcrypt = require("bcryptjs"),
	jwt = require("jsonwebtoken"),
	dbPool = require("../model"),
	{ SECRET } = process.env;

router.post("/login", (req, res, next) => {
	const { username, password } = req.body,
		userQuery = `SELECT id, password FROM app_user WHERE username=${username}`;

	dbPool.query(userQuery, async (error, results) => {
		try {
			if (error) throw error;
			const { password: hashedPassword, id: userId } = JSON.parse(
					JSON.stringify(results)
				)[0],
				passwordValidity = await bcrypt.compare(password, hashedPassword);

			if (!passwordValidity) throw new Error("Invalid Username/Password");
			return res.status(200).JSON({ token: await getValidJwt(userId) });
		} catch (error) {
			next(error);
		}
	});
});

const getValidJwt = async userId => await jwt.sign({ userId }, SECRET);

module.exports = router;
