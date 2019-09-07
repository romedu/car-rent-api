const router = require("express").Router(),
	inspectionsHelpers = require("../helpers/inspections");

router.get("/", inspectionsHelpers.findAll);

router.post("/", inspectionsHelpers.create);

router.get("/:id", inspectionsHelpers.findOne);

module.exports = router;
