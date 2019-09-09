const router = require("express").Router(),
	rentsHelpers = require("../helpers/rents"),
	{ checkIfToken } = require("../middlewares"),
	{ checkIfOwner } = require("../middlewares/rents");

router.get("/", rentsHelpers.findAll);

// Only authenticated users can proceed
router.post("/", checkIfToken, rentsHelpers.create);

router.get("/:id", rentsHelpers.findOne);

// Returns the rented vehicle
// Only the owner of the rent can proceed
router.patch("/:id", checkIfToken, checkIfOwner, rentsHelpers.returnRent);

module.exports = router;
