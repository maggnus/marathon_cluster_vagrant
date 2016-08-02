var express = require('express');
var router = express.Router();
var glob = require("glob");
var moment = require("moment");

var upload_dir = "public/upload";

function file_names(cb) {
    glob(upload_dir + "/*.pdf", {realpath: false}, function (er, files) {
        names = files.map(function (path) {
            return path.split("/").pop()
        });
        cb(names)
    })
}

/* GET home page. */
router.get('/', function (req, res, next) {
    file_names(function (names) {
        res.render('index', {files: names});
    })
});

/* Upload file */
router.post('/', function (req, res, next) {

    if (req.files) {
        var sampleFile = req.files.sampleFile;

        if (req.files.sampleFile.data.length > 0) {
            var studentName = moment().format('x');
            var week = moment().format('WW');
            var year = moment().format('gggg');
            var fileName = studentName + "_" + week + "_" + year + ".pdf";

            console.log("sampleFile => ", sampleFile);
            console.log("moveFile => ", fileName);

            sampleFile.mv(upload_dir + "/" + fileName, function (err) {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    file_names(function (names) {
                        res.render('index',
                            {
                                message: {
                                    type: "done",
                                    text: "File " + sampleFile.name + " (" + fileName + ") uploaded"
                                },
                                files: names
                            }
                        );
                    });
                }
            });

        } else {
            res.render('index',
                {
                    message: {
                        type: "error",
                        text: "File not uploaded"
                    }
                }
            );
        }
    }

});

module.exports = router;
