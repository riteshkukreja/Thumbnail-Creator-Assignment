const dimensions = [];//["755x450", "365x450", "365x212", "380x380"];
const picHolder = $("#images");
/**
 * Make Ajax call with promises
 */
const ajax = (url, method="GET", data=null) => {
    return new Promise((resolve, reject) => {
        const xmlHttpRequest = new XMLHttpRequest();
        
        xmlHttpRequest.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve(this.responseText);
            } else if(this.readyState == 4) {
                reject(this.responseText);
            }
        };

        xmlHttpRequest.open(method, url, true);
        xmlHttpRequest.send(JSON.stringify(data));
    });
};

/**
 * Adds all images for each id for each dimension to holder
 * @param {Array<Array<String>>} data list of list of images
 */
const addToHolder = async (data) => {
    data
        .map(pics => pics.map(createImage))
        .map(pics => pics.map((pic, i) => picHolder.append(pic)));
};

/**
 * Create a Image DOM element with given source
 * @param {String} image image source
 */
const createImage = (image, index) => {
    return $("<div/>", {
        class: "gallery_product col-lg-4 col-md-4 col-sm-4 col-xs-6 filter d" + dimensions[index]
    }).append(
        $("<img/>", {
            src: image,
            class: "img-responsive"
        })
        /** Open in new tab on click */
        .click(ev => window.open(image, "_blank"))
    );
};

$(document).ready(function() {
    /**
     * Image Preview Related Code
     * Show preview of image to upload
     * @param {Event} input file input change event
     */
    let state = -1;
    let cropperItem = null;
    const ratios = [];//[755 / 450, 365 / 450, 365 / 212, 380 / 380];
    const images = [];//[null, null, null, null];

    /**
     * Builds a preview window of uploaded image before uploading
     * @param {FileChangeEvent} input 
     */
    const showPreview = (input) => {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {

                /** Remove all previous thumbnails */
                $(".imagepreview").remove();

                /**
                 * Build preview for each dimension and hide them all
                 */
                dimensions.forEach(i => {
                    $("<img/>", {
                        id: `imagepreview${i}`,
                        src: e.target.result,
                        class: "imagepreview"
                    }).appendTo($("#previews"));

                    $(`#imagepreview${i}`).hide();
                });

                /** show next and uplaod button */
                $("#nextBtn").show();
                $("#uploadBtn").show();
                $("#localUploadBtn").hide();
                
                handleNext();
            };

            reader.readAsDataURL(input.files[0]);
        }
    };

    /**
     * Handle next button click
     */
    const handleNext = () => {
        if(cropperItem != null) {
            cropperItem.destroy();
            cropperItem = null;
            $(`#imagepreview${dimensions[state]}`).hide();
        }
        
        state++;
        $("#dimension").text(`(${dimensions[state]})`)

        /**
         * Show only upload button after all thumbnails data has been created
         */
        if(state > ratios.length-1) {
            $("#nextBtn").hide();
            $("#uploadBtn").show();
        } if(state == ratios.length-1) {
            $("#nextBtn").hide();
            $("#uploadBtn").show();
            $(`#imagepreview${dimensions[state]}`).show();
            buildSnapshots();
        } else {
            $(`#imagepreview${dimensions[state]}`).show();
            buildSnapshots();
        }
    };

    /** Build a snapshot on currently shown image */
    const buildSnapshots = () => {
        $(`#imagepreview${dimensions[state]}`).cropper({
            aspectRatio: ratios[state],
            viewMode: 0,
            scalable: false,
            zoomable: false,
            background: false,
            crop: (event) => {
                images[state] = event.detail;
            },
            ready: (event) => {
                cropperItem = $(`#imagepreview${dimensions[state]}`).data('cropper');
            }
        });
    };

    

    const initializeGalleryImages = () => {
        /**
         * Start the pipeline
         * Fetch all the ids from the server
         */
        return ajax("/gallery")
            /** Parse the data to JSON */
            .then(data => JSON.parse(data))
            /** Extract ids from response */
            .then(data => data.ids)
            /** Map each id to list of images for all dimensions */
            .then(data => data.map(id => dimensions.map(d => `/gallery/${id}/${d}`)))
            /** Add the extracted images to picHolder */
            .then(addToHolder)
            .catch(err => console.error(err));
    };
    
    const initializeGalleryConfig = () => {
        /**
         * Fetch configurations from server for allowed dimensions
         */
        return ajax("/gallery/config")
            .then(data => JSON.parse(data))
            .then(data => data.dimensions)
            .then(data => {
                dimensions.push(...data.map(a => a[0] + "x" + a[1]));
                ratios.push(...data.map(a => a[0] / a[1]));
                images.push(...data.map(a => null));

                /** Setup filters */
                dimensions
                    .map(a => $("<button/>", {
                        class: "btn btn-default filter-button",
                        "data-filter": "d" + a,
                        text: a
                    }))
                    .forEach(a => $("#filters").append(a));
            });
    };

    const initializeEvents = () => {
        /** Attach events */
        $("#nextBtn").click(handleNext);
        $("#imageUpload").change(function() {
            showPreview(this);
        });
        $("#uploadBtn").click(() => {
            /** Allow user to ovveride front-end thumnail setup and let server take care of it */
            if(confirm("Upload image with thumbnail details?"))
                $("#thumbnailsData").val(JSON.stringify(images));
        });
        
        $("#nextBtn").hide();
        $("#uploadBtn").hide();

        $(".filter-button").click(function() {
            var value = $(this).attr('data-filter');
            
            if(value == "all") {
                $('.filter').show('1000');
            }
            else {
                $(".filter").not('.'+value).hide('3000');
                $('.filter').filter('.'+value).show('3000');
                
            }
        });
        
        if ($(".filter-button").removeClass("active")) {
            $(this).removeClass("active");
        }
        
        $(this).addClass("active");
    };

    initializeGalleryConfig()
        .then(initializeGalleryImages)
        .then(initializeEvents)
        .catch(err => alert(err));
});