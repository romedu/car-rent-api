const dbPool = require("../model"),
	{ convertToWhereClause, createError } = require("../utils");

exports.findAll = (req, res, next) => {
	const { page = 1, ...queryParams } = req.query,
		//If there isn't any query params, omit the where clause
		whereClause = Object.keys(queryParams).length
			? `WHERE ${convertToWhereClause(queryParams)}`
			: "",
		query = `
               SELECT inspection.id AS id, inspection.created_at AS createdAt, vehicle.built_year AS builtYear, 
                      vehicle_image.front_image AS frontImage, model.description AS model, make.description AS make 
               FROM inspection
               INNER JOIN rent
               ON inspection.rent_id = rent.id
               INNER JOIN vehicle
               ON rent.vehicle_id = vehicle.id
               INNER JOIN vehicle_image
               ON vehicle_image.vehicle_id = vehicle.id
               INNER JOIN model
               ON model.id = vehicle.model_id
               INNER JOIN make
               ON make.id = model.make_id
               ${whereClause}
               ORDER BY vehicle.rents
               LIMIT ${page * 10 - 10}, ${page * 10};
            `;

	dbPool.query(query, (error, results) => {
		if (error) return next(error);
		const inspections = JSON.parse(JSON.stringify(results)), // Convert from array-like-object to array
			  responseData = {
				  page,
				  data: inspections
			  };
			  
		return res.status(200).json(responseData);
	});
};

exports.create = (req, res, next) => {
	const { rentId, employeeId, zest, fuelAmount } = req.body,
		{ currentUserId } = req.locals,
		query = `
            INSERT INTO inspection(rent_id, client_id, employee_id, zest, fuel_amount)
            VALUES (${rentId}, ${currentUserId}, ${employeeId}, ${zest}, ${fuelAmount});
         `;

	dbPool.query(query, (error, result) => {
		if (error) return next(error);
		const { insertId: inspectionId } = JSON.parse(JSON.stringify(result));
		return res.status(201).json({ inspectionId });
	});
};

exports.findOne = (req, res, next) => {
	const { id: inspectionId } = req.params,
		query = `
         SELECT inspection.*, employee.name AS employeeName, vehicle.built_year AS builtYear, 
                vehicle_image.front_image AS frontImage, model.description AS model, make.description AS make 
         FROM inspection
         INNER JOIN rent
         ON inspection.rent_id = rent.id
         INNER JOIN vehicle
         ON rent.vehicle_id = vehicle.id
         INNER JOIN vehicle_image
         ON vehicle_image.vehicle_id = vehicle.id
         INNER JOIN model
         ON model.id = vehicle.model_id
         INNER JOIN make
         ON make.id = model.make_id
         INNER JOIN employee
         ON employee.id = inspection.employee_id
         WHERE inspection.id = "${inspectionId}";
      `;

	dbPool.query(query, (error, results) => {
		if (error) return next(error);
		const inspection = JSON.parse(JSON.stringify(results))[0]; // Convert from array-like-object to array, and take the first and "only" result
		// If no inspection matches the id passed in the params, throw a not found error
		if (!inspection) {
			error = createError(404);
			return next(error);
		}
		return res.status(200).json({ inspection });
	});
};

module.exports = exports;
