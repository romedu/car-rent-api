const router = require("express").Router(),
	rentsHelpers = require("../helpers/rents");

router.get("/", rentsHelpers.findAll);

router.post("/", rentsHelpers.create);

router.get("/:id", rentsHelpers.findOne);

router.patch("/:id", rentsHelpers.returnRent);

module.exports = router;
