const router = require("express").Router(),
	authHelpers = require("../helpers/auth"),
	{ checkIfToken } = require("../middlewares");

router.post("/login", authHelpers.login);

router.post("/register", authHelpers.register);

router.get("/renew-token", checkIfToken, authHelpers.renewToken);

module.exports = router;
