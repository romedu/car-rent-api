const express = require("express"),
	morgan = require("morgan"),
	cors = require("cors"),
	app = express(),
	{ PORT } = process.env,
	vehiclesRoutes = require("./routes/vehicles"),
	rentsRoutes = require("./routes/rents"),
	inspectionsRoutes = require("./routes/inspections"),
	authRoutes = require("./routes/auth"),
	{ createError } = require("./utils");

app.use(cors("*"));
app.use(morgan("tiny"));
app.use(express.json());

app.use("/api/inspections", inspectionsRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/rents", rentsRoutes);
app.use("/api/auth", authRoutes);

app.use("*", (req, res, next) => {
	const error = createError(404);
	next(error);
});

app.use((error, req, res, next) => {
	console.error("Error: ", error);
	if (!error.status) error = createError(500);
	const { status, message } = error;
	return res.json({ error: { status, message } });
});

app.listen(PORT, () => {
	console.log("Server's running in port:", PORT);
});
