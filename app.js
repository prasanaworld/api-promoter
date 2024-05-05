const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

// Static Files
app.use(express.static("public"));
app.use("/my_logs.txt", express.static(__dirname + "public"));

app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const apiRouter = require("./api");

app.use("/", apiRouter);

// Listen on port 5000
app.listen(process.env.PORT || port, () =>
  console.log(`Listening on port ${port}`)
);
