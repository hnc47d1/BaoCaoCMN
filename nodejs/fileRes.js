var aws = require("aws-sdk");
var bucket = require('./bucKet');
var db = require('./dbRes');
var diacritics = require('diacritic');
aws.config.loadFromPath('../tsconfig.json');

exports.addfile = function (fields, fileTitle, files, callback) {
    //*************s3
    //Create bucket
    bucket.createBucket(fields.filename, function (resultCreateBucket) {
        if (!resultCreateBucket) {
            callback(-1);
        }
        else {
            //put image title
            bucket.putItem(fields.filename, fileTitle, function (fTitle) {
                if (fTitle == null) {
                    bucket.removeBucket(fields.filename);
                    callback(-2);
                }
                else {
                    //put images
                    bucket.putItems(fields.filename, images, function (file) {
                        //**********************end s3
                        //create festival model
                        var fileModel = {
                            "filename": fields.filename,
                            "Timestmap": Date.now(),
                            "file": file,
                            "KeyWordsContains": fields.filename.toLowerCase() + " - " +
                            removeVNMark(fields.filename.toLowerCase())
                        };
                        //add data to dynamodb
                        var params = {
                            "TableName": "Files",
                            "Item": fileModel
                        };
                        var docClient = new aws.DynamoDB.DocumentClient();
                        docClient.put(params, function (err, data) {
                            if (err) {
                                console.error("Put festival fail, error: ", JSON.stringify(err, null, 2));
                                bucket.removeBucket(fields.filename);
                                callback(-3);
                            } else {
                                console.log("Added fils");
                                callback(0);
                            }
                        });
                        //end add data to dynamodb
                    });
                }
            });
        }
    });
};
