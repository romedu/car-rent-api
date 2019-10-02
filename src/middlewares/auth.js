const validators = require("../validators"),
	{ createError } = require("../utils");

exports.validateLoginBody = (req, res, next) => {
	const propertyValidators = {
			username: stringToValidate =>
				validators.checkIfValidString(stringToValidate),
			password: stringToValidate =>
				validators.checkIfValidString(stringToValidate)
		},
		invalidFields = exports.validateBody(req.body, propertyValidators);

	if (invalidFields.length) {
		const errorMessage = `Invalid fields: ${invalidFields.join(", ")}`,
			error = createError(400, errorMessage);

		next(error);
	} else next();
};

exports.validateRegisterBody = (req, res, next) => {
	const propertyValidators = {
			username: stringToValidate =>
				validators.validateStringLength(stringToValidate, 8),
			password: stringToValidate =>
				validators.validateStringLength(stringToValidate, 8),
			name: stringToValidate =>
				validators.checkIfValidString(stringToValidate),
			nationalId: idToValidate =>
				validators.validateNationalId(idToValidate),
			cardNo: cardToValidate => validators.validateCardNo(cardToValidate),
			isJuridic: booleanToValidate =>
				validators.checkIfValidBoolean(booleanToValidate)
		},
		invalidFields = exports.validateBody(req.body, propertyValidators);

	if (invalidFields.length) {
		const errorMessage = `Invalid fields: ${invalidFields.join(", ")}`,
			error = createError(400, errorMessage);

		next(error);
	} else next();
};

exports.validateBody = (body, propertyValidators) => {
	const invalidFields = [];

	for (let [key, validator] of Object.entries(propertyValidators)) {
		const valueToValidate = body[key];
		if (!valueToValidate || !validator(valueToValidate)) {
			invalidFields.push(key);
		}
	}

	return invalidFields;
};

module.exports = exports;
