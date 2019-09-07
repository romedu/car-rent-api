const router = require("express").Router(),
	rentsHelpers = require("../helpers/rents"),
	{ checkIfToken } = require("../middlewares"),
	{ checkIfOwner } = require("../middlewares/rents");

router.get("/", rentsHelpers.findAll);

// Only authenticated users can proceed
router.post("/", checkIfToken, rentsHelpers.create);

router.get("/:id", rentsHelpers.findOne);

//MUST BE A CLIENT AND THE OWNER OD THE RENT
router.patch("/:id", checkIfToken, checkIfOwner, rentsHelpers.returnRent);

module.exports = router;
