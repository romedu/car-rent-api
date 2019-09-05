const router = require("express").Router(),
	dbPool = require("../model"),
	{ convertToWhereClause } = require("../utils");

router.get("/", (req, res, next) => {
	const { page = 1, ...queryParams } = req.query,
		//If there isn't any query params, omit the where clause
		whereClause = Object.keys(queryParams).length
			? `WHERE ${convertToWhereClause(queryParams)}`
			: "",
		query = `
				SELECT vehicle.*, vehicle_image.front_image AS front_image, model.description AS model, 
						  make.description AS make FROM vehicle
            INNER JOIN vehicle_image
				ON vehicle_image.vehicle_id = vehicle.id
				INNER JOIN make
				ON make.id = vehicle.make_id
				INNER JOIN model
				ON model.id = vehicle.model_id
            ${whereClause}
            ORDER BY vehicle.rents
            LIMIT ${page * 10 - 10}, ${page * 10};
          `;

	dbPool.query(query, (error, results) => {
		if (error) return next(error);
		return res
			.status(200)
			.json({ vehicles: JSON.parse(JSON.stringify(results)) });
	});
});

router.get("/:id", (req, res, next) => {
	const query = `
		SELECT vehicle.*, vehicle_image.front_image AS front_image, model.description AS model, 
				 make.description AS make FROM vehicle
		INNER JOIN vehicle_image
		ON vehicle_image.vehicle_id = vehicle.id
		INNER JOIN make
		ON make.id = vehicle.make_id
		INNER JOIN model
		ON model.id = vehicle.model_id
		WHERE vehicle.id = ${req.params.id};
	`;

	dbPool.query(query, (error, results) => {
		if (error) return next(error);
		res.status(200).json({ vehicle: JSON.parse(JSON.stringify(results))[0] });
	});
});

module.exports = router;
