const express = require("express");
const config = require("config");
const path = require("path");
const fs = require("fs");
const logger = require("logger").createLogger();

const CacheService = require("../services/CacheService");
const GoogleCloudStorageService = require("../services/GoogleCloudStorageService");

const app = express.Router();

/** GET route to get all available ids */
app.get("/", (req, res, next) => {
    /** Get all the images ids */
    logger.info("Getting all images id from cache");
    CacheService.get()
        .then(list => res.json({ ids: list }))
        .catch(err => next(err));
});

/** GET route to get all available dimensions */
app.get("/config", (req, res, next) => {
    /** Get all the thumbnail dimensions */
    logger.info("Getting all the thumbnail dimensions");
    const dimensions = config.get("crop_dimensions");
    res.json({dimensions});
});

/** GET route to get image for a particular id and dimension */
app.get("/:id/:dimension", (req, res, next) => {
    /** Get all the images ids */
    logger.info("Getting image with id: ", req.params.id);
    const dimensions = config.get("crop_dimensions")
            .map(a => a[0] + "x" + a[1])
            .filter(a => a === req.params.dimension);

    const dir = path.join(config.get("storage").path, req.params.id + dimensions[0]);
    if(dimensions.length == 0 || !fs.existsSync(dir)) {
        return next(`Image doesn't exists`);
    }

    /** Stream the file to output stream */
    fs.createReadStream(dir).pipe(res);
});

/** GET route to get image for a particular id and dimension from Cloud */
app.get("/cloud/:id/:dimension", (req, res, next) => {
    /** Get all the images ids */
    logger.info("Getting image with id: ", req.params.id);
    const dimensions = config.get("crop_dimensions")
            .map(a => a[0] + "x" + a[1])
            .filter(a => a === req.params.dimension);

    GoogleCloudStorageService.getImage(res.params.id + dimensions[0])
        .then((url) => res.end(url))
        .catch(err => next(err));
});

module.exports = app;
