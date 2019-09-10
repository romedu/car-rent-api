const router = require("express").Router(),
	rentsHelpers = require("../helpers/rents"),
	{ checkIfToken } = require("../middlewares"),
	rentMiddlewares = require("../middlewares/rents");

router.get("/", rentsHelpers.findAll);

// Only authenticated users can proceed
// Find the vehicle and check if it is available
router.post(
	"/",
	checkIfToken,
	rentMiddlewares.getCurrentVehicle,
	rentMiddlewares.checkVehicleAvailability,
	rentsHelpers.create
);

router.get("/:id", rentsHelpers.findOne);

// Returns(Makes it available again) the rented vehicle
// Only the owner of the rent can proceed
// Check if the vehicle was inspected and hasn't been returned yet
router.patch(
	"/:id",
	checkIfToken,
	rentMiddlewares.checkIfOwner,
	rentMiddlewares.getRentedVehicle,
	rentMiddlewares.checkVehicleUnavailability,
	rentMiddlewares.checkIfInspected,
	rentsHelpers.returnRent
);

module.exports = router;
