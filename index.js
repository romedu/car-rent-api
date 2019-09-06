require("dotenv").config();

const express = require("express"),
	morgan = require("morgan"),
	cors = require("cors"),
	app = express(),
	{ PORT } = process.env,
	vehiclesRoutes = require("./routes/vehicles"),
	rentsRoutes = require("./routes/rents"),
	authRoutes = require("./routes/auth");

app.use(cors("*"));
app.use(morgan("tiny"));
app.use(express.json());

app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/rents", rentsRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
	console.log("Server's running in port:", PORT);
});
