var aws = require('aws-sdk');
var fs = require('fs');
var diacritics = require('diacritic');


aws.config.loadFromPath('../tsconfig.json');

var s3 = new aws.S3();

//Get list bucket
exports.getListBucket = function(){
    var params = {};
    s3.listBuckets(params, function(err,data){
        if (err) console.log("Get bucket fail: " + err);
        else console.log("Get bucket success: " + JSON.stringify(data, null, 2));
    })
};

// Create bucket
//return true/false
exports.createBucket = function (bucketName, callback) {
    var myBucket = removeVNMark(bucketName);
    s3.createBucket({Bucket: myBucket}, function (err, data) {
        if (err) {
            console.log("--> CreateBucket error: " + err);
            callback(false);
        } else {
            console.log("--> CreateBucket create success.");
            callback(true);
        }
    });
};

// Put a item
//return json image
exports.putItem = function (bucketName, image, callback) {
    var _bucketName = removeVNMark(bucketName);
    var s3Bucket = new aws.S3({params: {Bucket: _bucketName}});
    var option = {
        Key: image.name,
        Body: fs.createReadStream(image.path),
        ACL: 'public-read'
    };
    s3Bucket.putObject(option, function (err, data) {
        if (err) {
            console.log('--> Put a item error:', err);
            callback(null);
        } else {
            var urlParams = {Bucket: _bucketName, Key: image.name};
            var url = s3Bucket.getSignedUrl('getObject', urlParams);
            try {
                var indexOfQuestion = url.indexOf('?');
                var urlFinal = url.substr(0, indexOfQuestion);
                var _image = {
                    "bucket": _bucketName,
                    "size": image.size,
                    "type": image.type,
                    "url": urlFinal,
                    "name": image.name
                };
                console.log('--> Put a item success.');
                callback(_image);
            }
            catch (exception) {
                console.log("--> Exception in put a item:" + exception);
                return -1;
            }
        }
    });
};

//Put items
//return json image
exports.putItems = function (bucketName, images, callback) {
    var _images = [];
    var _bucketName = removeVNMark(bucketName);
    var s3Bucket = new aws.S3({params: {Bucket: _bucketName}});
    var option;
    var count = 0;
    try{
        images.forEach(function (item) {
            count++;
            option = {
                Key: item.name,
                Body: fs.createReadStream(item.path),
                ACL: 'public-read'
            };
            var messageErr;
            s3Bucket.putObject(option, function (err, data) {
                if (err) {
                    console.log('--> Put items error, item  ' + count + ": " + err);
                    messageErr += "Put items error, item " + count + ": " + err;
                    if (count == images.length) {
                        callback(null);
                    }
                } else {
                    var urlParams = {Bucket: _bucketName, Key: item.name};
                    var url = s3Bucket.getSignedUrl('getObject', urlParams);
                    try {
                        var indexOfQuestion = url.indexOf('?');
                        var urlFinal = url.substr(0, indexOfQuestion);
                        _images.push({
                            "bucket": _bucketName,
                            "size": item.size,
                            "type": item.type,
                            "url": urlFinal,
                            "name": item.name
                        });
                        if (count == images.length) {
                            console.log('--> Put items success.');
                            callback(_images);
                        }
                    }
                    catch (exception) {
                        console.log("--> Exception in putItems: " + exception);
                        callback(null);
                    }
                }
            });
        });
    }
    catch(exception){
        console.log("--> Exception in putItems: " + exception);
        callback(null);
    }
};

//remove bucket
exports.removeBucket = function (bucketName) {
    var _bucketName = removeVNMark(bucketName);
    console.log("bucketName sau khi xoa dau va khoang trang  " + _bucketName)
    var paramsBucket = {Bucket: _bucketName};
    s3.listObjects(paramsBucket, function (err, data) {
        var objects = [];
        data.Contents.forEach(function (item) {
            objects.push({"Key": item.Key});
        });
        var params = {
            "Bucket": _bucketName,
            "Delete": {
                "Objects": objects
            }
        };
        s3.deleteObjects(params, function (err, data) {
            if (err) {
                console.log("--> Delete objects  error: " + err);
            }
            else {
                s3.deleteBucket({Bucket: _bucketName}, function (err, data) {
                    if (err) {
                        console.log("--> Delete bucket error: "+ err);
                    } else {
                        console.log("--> Delete bucket success");
                    }
                });
            }
        });
    });
};

//remove VietNamese mark
function removeVNMark(str) {
    if(str.trim() != null || str.trim() !=""){
        var noneSign = diacritics.clean(str).trim();
        var newStr = "";
        for (var i = 0; i < noneSign.length; i++) {
            if (noneSign[i] != ' ') {
                newStr += noneSign[i];
            }
        }
        return newStr;
    }
    return str;
}
