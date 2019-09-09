const dbPool = require("../model"),
	{ convertToWhereClause } = require("../utils");

exports.findAll = (req, res, next) => {
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
		const rents = JSON.parse(JSON.stringify(results));
		return res.status(200).json({ rents });
	});
};

exports.create = (req, res, next) => {
	const { vehicleId, rentDays, commentary, employeeId } = req.body,
		{ currentUserId } = req.locals,
		// The vehicle's rent_price is used to calculate the rent fee
		vehicleQuery = `(SELECT rent_price FROM vehicle WHERE vehicle.id = ${vehicleId})`;
	createRentQuery = `
               INSERT INTO rent(rent_days, commentary, fee, employee_id, client_id, vehicle_id)
               VALUES (
                        ${rentDays},
		                  ${commentary},
                        ${rentDays * vehicleQuery},
                        ${employeeId},
                        ${currentUserId},
                        ${vehicleId}
                      );
            `;

	// Bump the rented vehicles rent value and make it unavaible
	dbPool.query(createRentQuery, (error, rentResult) => {
		if (error) return next(error);

		const vehicleRentsQuery = `(SELECT rents FROM vehicle WHERE id = ${vehicleId})`,
			vehicleUpdateQuery = `
            UPDATE vehicle 
            SET rents = ${vehicleRentsQuery} + 1,
                available = false
            WEHRE id = ${vehicleId}
         `;

		dbPool.query(vehicleUpdateQuery, error => {
			if (error) return next(error);
			const { insertId: rentId } = JSON.parse(JSON.stringify(rentResult));
			return res.status(201).json({ rentId });
		});
	});
};

exports.findOne = (req, res, next) => {
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
		const rent = JSON.parse(JSON.stringify(results))[0];
		return res.status(200).json({ rent });
	});
};

exports.returnRent = (req, res, next) => {
	const { id: rentId } = req.params,
		currentDate = new Date(),
		query = `UPDATE rent set returned_at = ${currentDate} where id = ${rentId};`;

	// Make the vehicle avaible after it was returned
	dbPool.query(query, error => {
		if (error) return next(error);
		const vehicleIdQuery = `(SELECT vehicle_id FROM rent WHERE id = ${rentId})`,
			vehicleUpdateQuery = `
               UPDATE vehicle SET available = true
               WHERE id = ${vehicleIdQuery};
            `;

		dbPool.query(vehicleUpdateQuery, error => {
			if (error) return next(error);
			return res.status(200).json({ message: "Rent updated successfully" });
		});
	});
};

module.exports = exports;
