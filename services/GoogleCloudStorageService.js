const GoogleCloudStorage = require('@google-cloud/storage');
const config = require("config");

const storage = GoogleCloudStorage({
  projectId: config.get("storage").project_id,
  keyFilename: config.get("storage").keyFilename
});

const BUCKET_NAME = config.get("storage").bucket;

class GoogleCloudStorageService {

    constructor() {
        this.bucket = storage.bucket(BUCKET_NAME);
    }

    getImage(id) {
        return this.bucket.file(id).getSignedUrl();
    }

    add(image) {
        return this.bucket.upload(image, { public: true })
            .then((val => `https://storage.googleapis.com/${BUCKET_NAME}/${val}`));
    }
};

module.exports = new GoogleCloudStorageService();