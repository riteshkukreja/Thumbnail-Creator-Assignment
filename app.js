const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
const logger = require("logger").createLogger();
const morgan = require("morgan");
const path = require("path");

const app = express();

logger.setLevel(config.get("log_level"));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use(express.static(path.join(__dirname, "static")));

app.use('/upload', require("./routes/upload"));
app.use('/gallery', require("./routes/gallery"));

app.use((err, req, res, next) => {
    logger.error("exception while handling request ", err);
    res.status(500).json({error: err});
});

const server = app.listen(config.get("port"), config.get("host"), () => {
    logger.info("Starting server at ", server.address().address, server.address().port);
});