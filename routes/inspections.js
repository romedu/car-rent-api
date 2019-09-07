const router = require("express").Router(),
	inspectionsHelpers = require("../helpers/inspections"),
	{ checkIfToken } = require("../middlewares");

router.get("/", inspectionsHelpers.findAll);

// Only authenticated users can proceed
router.post("/", checkIfToken, inspectionsHelpers.create);

router.get("/:id", inspectionsHelpers.findOne);

module.exports = router;
