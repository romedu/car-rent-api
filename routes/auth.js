const router = require("express").Router(),
	authHelpers = require("../helpers/auth");

router.post("/login", authHelpers.login);

router.post("/register", authHelpers.register);

module.exports = router;
