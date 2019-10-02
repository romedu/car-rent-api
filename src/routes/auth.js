const router = require("express").Router(),
	authHelpers = require("../helpers/auth"),
	{ checkIfToken } = require("../middlewares"),
	{ validateLoginBody, validateRegisterBody } = require("../middlewares/auth");

router.post("/login", validateLoginBody, authHelpers.login);

router.post("/register", validateRegisterBody, authHelpers.register);

router.get("/renew-token", checkIfToken, authHelpers.renewToken);

module.exports = router;
