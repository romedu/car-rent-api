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
         SELECT rent.*, vehicle.built_year AS built_year, vehicle_image.front_image AS front_image, 
                  model.description AS model, make.description AS make FROM rent
         INNER JOIN vehicle
         ON rent.vehicle_id = vehicle.id
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
			.json({ rents: JSON.parse(JSON.stringify(results)) });
	});
});

router.post("/", (req, res, next) => {
	const { vehicleId } = req.body,
		vehicleQuery = `
            SELECT rent_price FROM vehicle
            WHERE vehicle.id = ${vehicleId};
         `;

	// The vehicle's rentPrice is used to calculate the rent fee
	dbPool.query(vehicleQuery, (error, vehicleResult) => {
		if (error) return next(error);

		const { rentDays, commentary, employeeId, clientId } = req.body,
			{ rent_price: rentPrice } = JSON.parse(
				JSON.stringify(vehicleResult)
			)[0],
			createRentQuery = `
               INSERT INTO rent(rent_days, commentary, fee, employee_id, client_id, vehicle_id)
               VALUES (${(rentDays,
					commentary,
					rent_days * rentPrice,
					employeeId,
					clientId,
					vehicleId)});
            `;

		// TODO: MAKE A TRIGGER THAT BUMPS THE VEHICLE RENTS AND MAKES IT UNAVAILABLE AFTER IT IS RENTED
		dbPool.query(createRentQuery, error => {
			if (error) return next(error);
			return res.status(201).json({ message: "Rent created successfully" });
		});
	});
});

router.get("/:id", (req, res, next) => {
	const { id: rentId } = req.params,
		query = `
         SELECT rent.*, vehicle.built_year AS built_year, vehicle_image.front_image AS front_image, 
               model.description AS model, make.description AS make, person.name AS client_name FROM rent
         INNER JOIN vehicle
         ON rent.vehicle_id = vehicle.id
         INNER JOIN vehicle_image
         ON vehicle_image.vehicle_id = vehicle.id
         INNER JOIN make
         ON make.id = vehicle.make_id
         INNER JOIN model
         ON model.id = vehicle.model_id
         INNER JOIN client
         ON client.id = rent.client_id
         INNER JOIN person
         ON person.id = client.person_id
         WHERE rent.id = ${rentId};
      `;

	dbPool.query(query, (error, results) => {
		if (error) return next(error);
		return res
			.status(200)
			.json({ rent: JSON.parse(JSON.stringify(results))[0] });
	});
});

router.patch("/:id", (req, res, next) => {
	const { id: rentId } = req.params,
		{ returnedAt } = req.body,
		query = `UPDATE rents set returned_at = ${returnedAt} where id = ${rentId};`;

	// TODO: MAKE A TRIGGER THAT MAKES THE VEHICLE AVAILABLE AFTER IT IS RETURNED
	dbPool.query(query, error => {
		if (error) return next(error);
		return res.status(200).json({ message: "Rent updated successfully" });
	});
});

module.exports = router;
