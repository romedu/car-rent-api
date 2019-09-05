require("dotenv").config();

const express = require("express"),
      morgan = require("morgan"),
      cors = require("cors"),
      app = express(),
      {PORT} = process.env,
      vehiclesRoutes = require("./routes/vehicles");

app.use(cors("*"));
app.use(morgan("tiny"));
app.use(express.json());

app.use("/api/vehicles", vehiclesRoutes);

app.listen(PORT, () => {
    console.log("Server's running in port:", PORT);
});