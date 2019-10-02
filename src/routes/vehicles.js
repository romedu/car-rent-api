const router = require("express").Router(),
	vehiclesHelpers = require("../helpers/vehicles");

router.get("/", vehiclesHelpers.findAll);

router.get("/:id", vehiclesHelpers.findOne);

router.post("/send-report", vehiclesHelpers.sendMail);

module.exports = router;
