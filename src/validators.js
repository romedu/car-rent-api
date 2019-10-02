const { card } = require("creditcards");

exports.checkIfValidBoolean = booleanToValidate => {
	return typeof booleanToValidate === "boolean";
};

exports.checkIfValidString = stringToValidate => {
	return (
		typeof stringToValidate === "string" && stringToValidate.trim().length
	);
};

exports.validateStringLength = (stringToValidate, minLength) => {
	return (
		typeof stringToValidate === "string" &&
		stringToValidate.trim().length >= minLength
	);
};

exports.validateCardNo = cardNo => card.isValid(cardNo);

exports.validateNationalId = nationalId => {
	if (nationalId.length !== 11 || isNaN(Number(nationalId))) return false;
	const processedIdDigits = nationalId.split("").map((digit, index, arr) => {
		let currentDigit = Number(digit);
		if (index >= arr.length - 1) return 0;
		if (index % 2) currentDigit *= 2;
		if (currentDigit >= 10) currentDigit -= 9;
		return currentDigit;
	});

	const processedDigitsSum = processedIdDigits.reduce(
		(acc, nextVal) => acc + nextVal,
		0
	);

	return Number(nationalId[10]) === getVerifierNum(processedDigitsSum);
};

const getVerifierNum = processedDigitsSum => {
	let verifier = processedDigitsSum;

	while (verifier % 10 !== 0) verifier++;

	verifier -= processedDigitsSum;
	if (verifier === 10) return 0;
	return verifier;
};

module.exports = exports;
