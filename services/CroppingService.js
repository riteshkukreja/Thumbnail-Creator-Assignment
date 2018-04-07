const sharp = require("sharp");
const fs = require("fs");
const config = require("config");
const path = require("path");
const logger = require("logger").createLogger();

class CroppingService {

    constructor(...thumbSizes) {
        this._sizes = thumbSizes;
    }

    bind(image) {
        return this._sizes
                .map(size => new CropItem(image, size));
    }

}

class CropItem {

    constructor(image, size) {
        this.image = sharp(image);
        this.size = size;
    }

    execute() {
        this.image = this.image
            .resize(this.size.width, this.size.height)
            .crop(sharp.strategy.entropy)
            .png();

        return this;
    }

    extract(x, y) {
        if(x < 0) x = 0;
        if(x > (config.get("upload_limits").width - this.size.width)) x = (config.get("upload_limits").width - this.size.width);
        
        if(y < 0) y = 0;
        if(y > (config.get("upload_limits").height - this.size.height)) y = (config.get("upload_limits").height - this.size.height);

        this.image = this.image
            .extract({ width: this.size.width, height: this.size.height, left: parseInt(x), top: parseInt(y)})
            .resize(this.size.width, this.size.height)
            .png();

        return this;
    }
}

class CropSize {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

module.exports = new CroppingService(
    ...config.get("crop_dimensions")
        .map(a => new CropSize(a[0], a[1]))
);