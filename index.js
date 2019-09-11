require("dotenv").config();

const express = require("express"),
	morgan = require("morgan"),
	cors = require("cors"),
	app = express(),
	{ PORT } = process.env,
	vehiclesRoutes = require("./routes/vehicles"),
	rentsRoutes = require("./routes/rents"),
	inspectionsRoutes = require("./routes/inspections"),
	authRoutes = require("./routes/auth");

app.use(cors("*"));
app.use(morgan("tiny"));
app.use(express.json());

app.use("/api/inspections", inspectionsRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/rents", rentsRoutes);
app.use("/api/auth", authRoutes);

app.use("*", (req, res) => {
	return res.status(404).json({ error: "Not Found" });
});

app.use((error, req, res, next) => {
	console.log("Fatal Error: ", error.message);
	return res.json({ error: error.message });
});

app.listen(PORT, () => {
	console.log("Server's running in port:", PORT);
});
