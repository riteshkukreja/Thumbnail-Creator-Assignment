const express = require("express");
const fileUpload = require('express-fileupload');
const config = require("config");
const fs = require("fs");
const path = require("path");
const uuid = require("node-uuid");
const logger = require("logger").createLogger();

const CroppingService = require("../services/CroppingService");
const CacheService = require("../services/CacheService");
const GoogleCloudStorageService = require("../services/GoogleCloudStorageService");

const app = express.Router();

/**
 * Set file upload criterias
 */
app.use(fileUpload({
    limits: { fileSize: config.get("upload_limits").size, files: 1 },
    safeFileNames: true,
    preserveExtension: true,
    abortOnLimit: true
}));

/** POST route to upload an image to server */
app.post('/', (req, res, next) => {
    if (!req.files || !req.files.pic)
        return next("No image was provided");

    const thumbData = req.body.thumbData ? JSON.parse(req.body.thumbData): undefined;
    
    try {
        /** Get the uploaded image */
        const uploadedImage = req.files.pic;

        /** Unique name for uploaded image */
        const filename = uuid.v4() + ".png";

        /** Pass the image to image manipulation service */
        const cropItems = CroppingService
            .bind(uploadedImage.data);

        /** Validate image */
        validateImage(cropItems)
            .then(meta => { 
                /** Create thumbnails on successful validation */
                const imagePromises = cropItems
                        .map((cropItem, i) => {
                            if(thumbData && thumbData.length > i && thumbData[i] && thumbData[i].x && thumbData[i].y)
                                return cropItem.extract(thumbData[i].x, thumbData[i].y)
                            else
                                return cropItem.execute();
                        })
                        .map(cropItem => processImage(cropItem, filename));
        
                /** On all completion */
                Promise.all(imagePromises)
                    .then(() => {
                        CacheService.set(filename);
                        res.redirect("/");
                    })
                    .catch(err => next(err));    
            })
            .catch(err => next(err));
    } catch(e) {
        logger.error("Exception while converting image: ", e);
        next(e);
    }
});

/**
 * Saves thumbnail based on given CropItem instance dimensions
 * @param {CropItem} cropItem instance of CropItem with dimension and Sharp Image
 * @param {String} filename Final name of the uploaded image
 */
const processImage = (cropItem, filename) => {
    const dimension = cropItem.size.width + "x" + cropItem.size.height;
    const filePath = path.join(config.get("storage").path, filename + dimension);

    logger.info("Saving image thumbnail at : ", filePath);

            /** Copy file to upload dir */
    return cropItem.image.toFile(filePath)
            /** Upload to Google Cloud Storage */
            /** TODO: uncomment this and line below to see images being stored on cloud */
            // .then(val => GoogleCloudStorageService.add(filePath))
            /** Remove the local version of file */
            // .then(val => fs.unlinkSync(filePath));
};

/**
 * Do basic validation based on image size and extensions
 * @param {List<CropItem>} cropItems list of CropItem instances
 */
const validateImage = (cropItems) => {
    logger.info("Validating images");
    
    return cropItems[0].image.metadata()
        /** Validate image extensions */
        .then(validateImageExtension)
        /** Validate image dimensions */
        .then(validateImageDimensions)
};

/**
 * Validate if the image extensions lies in allowed extensions list
 * @param {MetaData} meta metadata of image using Sharp instance
 */
const validateImageExtension = (meta) => {
    const validImageTypes = config.get("upload_limits").types;

    if(validImageTypes.includes(meta.format))
        return meta;
    throw `Image Type: ${meta.format} is not supported. Only images with type ${validImageTypes} are supported.`;
}

/**
 * Validate if the image dimensions is allowed
 * @param {MetaData} meta metadata of image using Sharp instance
 */
const validateImageDimensions = (meta) => {
    const validImageWidth = config.get("upload_limits").width;
    const validImageHeight = config.get("upload_limits").height;

    if(meta.width === validImageWidth && meta.height === validImageHeight)
        return meta;
    throw `Image Size: ${meta.width}x${meta.height} is not supported. Only images with dimensions ${validImageWidth}x${validImageHeight} is supported.`;
}

module.exports = app;
