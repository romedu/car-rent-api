const router = require("express").Router(),
	inspectionsHelpers = require("../helpers/inspections"),
	{ checkIfToken } = require("../middlewares"),
	inspectionMiddlewares = require("../middlewares/inspections");

router.get("/", inspectionsHelpers.findAll);

// Only authenticated users can proceed
// Check if the one inspecting the vehicle is the one who rented it MISSING
// Check if the vehicle is currently rented
// Check if the rented vehicle hasn't been inspected
router.post(
	"/",
	checkIfToken,
	inspectionMiddlewares.getCurrentRent,
	inspectionMiddlewares.checkIfIsRenter,
	inspectionMiddlewares.checkIfRented,
	inspectionMiddlewares.checkIfNotInspected,
	inspectionsHelpers.create
);

router.get("/:id", inspectionsHelpers.findOne);

module.exports = router;
