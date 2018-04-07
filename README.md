# Thumbnail Creator Assignment

## Requirements
- A web panel where the user can upload an image 
- Each image has a recommended size of 1024 x 1024. 
- Don’t upload the file if it’s not the right size. 
- Each image has to be converted into 4 different sizes. (755 x 450, 365 x 450, 365 x 212, 380 x 380)
- Save all 4 of these images locally on the server 
- Show a webpage with all 4 of these new images.
- Upload them to a cloud image hosting service.
- While uploading the image show a preview in the browser itself of all the different image sizes, and let the user decide how to crop the images to the smaller size.

## Tasks
- [x] Web Panel to upload and see upload images.
- [x] Implement image upload criteria based on image size being 1024x1024.
- [x] Crop uploaded images in given sizes on back-end side.
- [x] Store images locally and allow upload to Google Cloud Storage.
- [x] Allow user to select part of image to crop on front-end and crop it based on user's selection.

## Requirements
It depends on `Redis` to store application data and `Google cloud storage` to upload images. Search for `TODO` to locate options to turn on/off Google cloud storage

## Configurations
### port
Port at which the node application will run on. Default: `3000`.
### host
Host at which the node application will run on. Default: `localhost`.
### log_level
Level of logging to output to console. Default: `debug`.
### upload_limits
- *types*: Image extensions allowed. Default `["jpeg", "jpg", "png"]`.
- *width*: Image width allowed. Default `1024`.
- *height*: Image height allowed. Default `1024`.
### crop_dimensions
List of dimensions (width, height) of the final cropped images. Default `[ [755, 450], [365, 450], [365, 212], [380, 380] ]`.
### redis
Redis based configurations for connection.
- *host*: Host on which redis is running on. Default: `localhost`.
- *port*: Port on which redis is running on. Default: `6379`.
- *key*: Array key in redis for application data. Default: `images`.
### storage
Storage based configurations
- *path*: Path of upload directory. Default: `uploads`.
- *project_id*: Project ID on Google cloud console.
- *keyFilename*: Key file path.
- *bucket*: Bucket name on Google cloud console. (not generated on runtime)

## Docker Running
You can directly use docker to run the application with redis. It uses different version of configuration file `default.docker.config`.
```
docker-compose up --build
```
