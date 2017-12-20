
var AWS = require("aws-sdk"),
    express = require('express'),
    path = require('path'),
    fs = require("fs"),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    multerS3 = require('multer-s3'),
    app = express();
AWS.config.loadFromPath('/home/ubuntu/BaoCaoCMN/tsconfig.json');



app.use(bodyParser.json()); // support json encoded bodies
app.use(express.static(path.join(__dirname, '/public')));

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var docClient = new AWS.DynamoDB.DocumentClient();

app.set("view engine" , "ejs");
app.set("views","./views");

<!--get to login page-->
app.get('/', function (req, res) {
    res.render("index");

});
app.get('/file',function (req,res) {
     var params = {
         TableName: "Files"
    };
    console.log("Scanning files table.");
    docClient.scan( params, function (err, data) {
        if (err) {
            console.error("Không tải được hình ảnh: " + JSON.stringify(err, null, 2));
        } else {
            var itemdata ={
                dulieu: data
            };
            console.log(data)
            res.render('main',itemdata);
        }
    });
});
app.get('/search', function ( req, res ) {

    var searchKey = req.query.search;
    console.log(searchKey);

    var params = {

        ProjectionExpression:"FileName ,Timestmap , FileMimetyoe, Urlname ",
        ScanIndexForward: false,
        FilterExpression: "contains(FileName, :key) or contains(:key,FileName) or contains(KeyWordsContains, :keyLowerCase) or contains(:keyLowerCase,KeyWordsContains)",
        ExpressionAttributeValues: {
            ":key":searchKey,
            ":keyLowerCase": searchKey.toLowerCase()
        },
        TableName : "Files"
    };
    docClient.scan(params, function (err, data) {
        if (err) {
            console.error("Thất bại", JSON.stringify(err, null, 2));
        } else {
            console.log("Tìm Thành công");
            var searchdata ={
                dulieu: data
            };
            console.log(data)
            res.render('search',searchdata);
            console.log(data);
        }
    });

})
app.get('/login',function (req,res) {
    res.render("login");
});
<!--login action -->
app.post('/login',urlencodedParser, function (req, res) {

     var table = "Users";

    var email =req.body['email'];
    var pass = req.body['pass'];

    console.log(email);
    console.log(pass);

    var params = {
        TableName: table,
        Key:{
            "email": email,
            "pass": pass
        }
    };
    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Thất bại :", JSON.stringify(err, null, 2));
        } else {
            try{
                console.log("Lấy thành công rồi nhé", JSON.stringify(data, null, 2));
                var d_email=data.Item.email;
                var d_pass=data.Item.pass;
////////////////////////////////////////////////////LOAD DU LIEU LEN TRANG CHU /////////////////////////////////////////
                var params = {
                    TableName: "Files"
                };
                console.log("Dang tìm nha ");
                docClient.scan( params, function (err, data) {
                    if (err) {
                        console.error("Không tải được hình ảnh: " + JSON.stringify(err, null, 2));
                    } else {
                        var hay ={
                            dulieu: data
                        };
                        console.log(data)
                        res.render('main',hay);
                    }
                });
            } catch (exception){

                res.end();
            }
        }
    });
});

<!--load upload page -->
app.get('/upload', function (req, res) {
    res.render("upload");
});

<!--action upload page -->
var  s3 = new AWS.S3();
app.use(bodyParser.json());
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'trung123',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname); //use Date.now() for unique file keys
            var url="http://s3-us-west-2.amazonaws.com/trung123/"+file.originalname;
            var params = {
                TableName:"Files",
                Item:{
                    "FileName": file.originalname,
                    "Timestmap": Date.now(),
                    "FileMimetyoe":file.mimetype,
                    "Urlname":url
                }
            };
            console.log(file.size);
            console.log("Đang thêm mới nhé");
            docClient.put(params, function(err, data) {
                if (err) {
                    console.error("Thất bại", JSON.stringify(err, null, 2));
                } else {
                    console.log("Thành Công", JSON.stringify(data, null, 2));
                }
            });
        }
    })
});
app.get('/delete',function (req , res) {
     var detelefilename = req.query.tagId;
     console.log(detelefilename);
// XÓA FILE TRONG BUCKET
    var paramsDelete = {
        Bucket: 'trung123',
        Delete: { // required
            Objects: [ // required
                {
                    Key:  detelefilename// required
                }

            ],
        },
    };
    s3.deleteObjects(paramsDelete, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
//XÓA ITEM TRONG BẢNG
    var params = {
        TableName: "Files",
            Key: {
                 "FileName": detelefilename ,
    }
    };
    docClient.delete(params, function(err, data) {
        if (err) console.log(err);
        else {
           console.log("Thành công...");
            var params = {
                TableName: "Files"
            };
            console.log("Dang tìm nha ");
            docClient.scan( params, function (err, data) {
                if (err) {
                    console.error("Không tải được hình ảnh: " + JSON.stringify(err, null, 2));
                } else {
                    var hay ={
                        dulieu: data
                    };
                    console.log(data)
                    res.render('main',hay);
                }
            });
        }

    });
 });
app.post('/upload',upload.array('upl',1), function (request, res, next) {
       res.render("uploaded");
});
<!--load user register page -->
app.get('/register', function (req, res) {
    res.render("register");
});
<!--action  register user page -->
app.post('/register', function (req, res) {
    // Prepare output in JSON format
    var docClient = new AWS.DynamoDB.DocumentClient();
    var email =req.query['email'];
    var pass = req.query['pass'];

    console.log(email);
    console.log(pass);
    var params = {
        TableName:'Users',
        Item:{
            "email": email,
            "pass": pass,
        }
    };

    console.log("Đang đăng ký .... đợi xíu.....");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Thất bại:", JSON.stringify(err, null, 2));
        } else {
            console.log("Thành Công", JSON.stringify(data, null, 2));
           res.render("register")
            res.end();
        }
    });
    res.end();
});

var server = app.listen(8899, function () {
    console.log(" App listening at http://localhost:8899");
});
