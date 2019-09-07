const dbPool = require("../model"),
	{ convertToWhereClause } = require("../utils");

exports.findAll = (req, res, next) => {
	const { page = 1, ...queryParams } = req.query,
		//If there isn't any query params, omit the where clause
		whereClause = Object.keys(queryParams).length
			? `WHERE ${convertToWhereClause(queryParams)}`
			: "",
		query = `
               SELECT inspection.id AS id, inspection.created_at AS created_at, vehicle.built_year AS built_year, 
                      vehicle_image.front_image AS front_image, model.description AS model, make.description AS make FROM inspection
               INNER JOIN vehicle
               ON inspection.vehicle_id = vehicle.id
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
		const inspections = JSON.parse(JSON.stringify(results));
		return res.status(200).json({ inspections });
	});
};

exports.create = (req, res, next) => {
	const { vehicleId, clientId, employeeId, zest, fuelAmount } = req.body,
		query = `
            INSERT INTO inspection(vehicle_id, client_id, employee_id, zest, fuel_amount)
            VALUES (${vehicleId}, ${clientId}, ${employeeId}, ${zest}, ${fuelAmount});
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
         SELECT inspection.*, employee.name AS employee_name, vehicle.built_year AS built_year, 
         vehicle_image.front_image AS front_image, model.description AS model, make.description AS make FROM inspection
         INNER JOIN vehicle
         ON inspection.vehicle_id = vehicle.id
         INNER JOIN vehicle_image
         ON vehicle_image.vehicle_id = vehicle.id
         INNER JOIN make
         ON make.id = vehicle.make_id
         INNER JOIN model
         ON model.id = vehicle.model_id
         INNER JOIN employee
         ON employee.id = inspection.employee_id
         WHERE inspection.id = ${inspectionId};
      `;

	dbPool.query(query, (error, results) => {
		if (error) return next(error);
		const inspection = JSON.parse(JSON.stringify(results))[0];
		return res.status(200).json({ inspection });
	});
};

module.exports = exports;
