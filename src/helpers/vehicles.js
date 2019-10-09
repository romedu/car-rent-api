const nodemailer = require("nodemailer"),
	dbPool = require("../model"),
	{ convertToWhereClause, createError } = require("../utils");

exports.findAll = (req, res, next) => {
	const { page = 1, ...queryParams } = req.query,
		//If there isn't any query params, omit the where clause
		whereClause = Object.keys(queryParams).length
			? `WHERE ${convertToWhereClause(queryParams)}`
			: "",
		query = `
            SELECT vehicle.id, vehicle.built_year AS builtYear, CONCAT("$", vehicle.rent_price) AS rentPrice, vehicle_image.front_image AS frontImage, 
                   model.description AS model, make.description AS make, body_style.description AS bodyStyle,
                   fuel.description AS fuel
            FROM vehicle
            INNER JOIN vehicle_image
            ON vehicle_image.vehicle_id = vehicle.id
            INNER JOIN body_style
            ON body_style.id = vehicle.body_style_id
            INNER JOIN fuel
            ON fuel.id = vehicle.fuel_id
				INNER JOIN model
            ON model.id = vehicle.model_id
            INNER JOIN make
            ON make.id = model.make_id
            ${whereClause}
            ORDER BY vehicle.rents
            LIMIT 10
            OFFSET ${page * 10 - 10};
          `;

	dbPool.query(query, (error, results) => {
		if (error) return next(error);
		const vehicles = JSON.parse(JSON.stringify(results)), // Convert from array-like-object to array
			responseData = {
				page,
				data: vehicles
			};

		return res.status(200).json(responseData);
	});
};

exports.findOne = (req, res, next) => {
	const query = `
      SELECT vehicle.chassisNo, vehicle.engineNo, vehicle.plateNo, vehicle.rents, vehicle.available, 
             vehicle.description AS color, vehicle.built_year AS builtYear, vehicle_image.front_image AS frontImage, 
             model.description AS model, make.description AS make, body_style.description AS bodyStyle, fuel.description AS fuel
      FROM vehicle
		INNER JOIN vehicle_image
		ON vehicle_image.vehicle_id = vehicle.id
		INNER JOIN model
      ON model.id = vehicle.model_id
      INNER JOIN make
		ON make.id = model.make_id
      INNER JOIN body_style
      ON body_style.id = vehicle.body_style_id
      INNER JOIN fuel
      ON fuel.id = vehicle.fuel_id
		WHERE vehicle.id = "${req.params.id}";
	`;

	dbPool.query(query, (error, results) => {
		if (error) return next(error);
		const vehicle = JSON.parse(JSON.stringify(results))[0]; // Convert from array-like-object to array, and take the first and "only" result
		// If no vehicle matches the id passed in the params, throw a not found error
		if (!vehicle) {
			error = createError(404);
			return next(error);
		}
		res.status(200).json({ vehicle });
	});
};

exports.sendMail = async (req, res, next) => {
	try {
		const { ...queryParams } = req.query,
			//If there isn't any query params, omit the where clause
			whereClause = Object.keys(queryParams).length
				? `WHERE ${convertToWhereClause(queryParams)}`
				: "",
			query = `
            SELECT vehicle.id, vehicle.built_year AS builtYear, CONCAT("$", vehicle.rent_price) AS rentPrice, vehicle_image.front_image AS frontImage, 
            model.description AS model, make.description AS make, body_style.description AS bodyStyle,
            fuel.description AS fuel
            FROM vehicle
            INNER JOIN vehicle_image
            ON vehicle_image.vehicle_id = vehicle.id
            INNER JOIN body_style
            ON body_style.id = vehicle.body_style_id
            INNER JOIN fuel
            ON fuel.id = vehicle.fuel_id
            INNER JOIN model
            ON model.id = vehicle.model_id
            INNER JOIN make
            ON make.id = model.make_id
            ${whereClause}
            ORDER BY vehicle.rents
         `;

		dbPool.query(query, async (error, results) => {
			if (error) return next(error);
			const vehicles = JSON.parse(JSON.stringify(results)), // Convert from array-like-object to array
				{ EMAIL_HOST, EMAIL_PASSWORD } = process.env,
				transporter = nodemailer.createTransport({
					host: "Smtp.live.com",
					service: "Outlook",
					port: 587,
					secure: false,
					tls: {
						rejectUnauthorized: false
					},
					auth: {
						user: EMAIL_HOST,
						pass: EMAIL_PASSWORD
					}
				});

			try {
				const { email: emailReceiver } = req.body,
					mailOptions = {
						from: `"Rent-Car-App👻" ${EMAIL_HOST}`,
						to: emailReceiver,
						subject: `Vehicles Report`,
						text: vehicles.map(obj => JSON.stringify(obj)).join("\n\n")
					};

				if (!emailReceiver) throw createError(400, "Invalid email address");
				else await transporter.sendMail(mailOptions);

				return res
					.status(200)
					.json({ message: "The report was sent to your email" });
			} catch (error) {
				return next(error);
			}
		});
	} catch (error) {
		return next(error);
	}
};

module.exports = exports;
