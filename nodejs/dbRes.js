var aws = require("aws-sdk");

aws.config.loadFromPath('../tsconfig.json');

exports.updateItem = function(params){
    var dynamodb = new aws.DynamoDB();
    dynamodb.updateItem(params, function(err,data){
        if (err) {
            console.error("Update item fail. Error:\n", JSON.stringify(err, null, 2));
        } else {
            console.log("Update item success: \n", JSON.stringify(data, null, 2));
        }
    });
};

exports.deleteItem = function(params){
    var dynamodb = new aws.DynamoDB();
    dynamodb.deleteItem(params, function(err,data){
        if (err) {
            console.error("Delete item fail. Error:\n", JSON.stringify(err, null, 2));
        } else {
            console.log("Delete item success: \n", JSON.stringify(data, null, 2));
        }
    });
};

//table is data json with syntax parameter create table
exports.createTable = function (table) {
    var dynamodb = new aws.DynamoDB();
    dynamodb.createTable(table, function (err, data) {
        if (err) {
            console.error("Create table fail. Error:\n", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table success: \n", JSON.stringify(data, null, 2));
        }
    });
};

exports.deleteTable = function (tableName) {
    var params = {
        TableName: tableName
    };
    var dynamodb = new aws.DynamoDB();
    dynamodb.deleteTable(params, function (err, data) {
        if (err) console.log("Delete table fail. Error:\n" + err);
        else console.log("Delete table success:\n" + JSON.stringify(data, null, 2));
    });
};

exports.getListTable = function () {
    var params = {};
    var dynamodb = new aws.DynamoDB();
    dynamodb.listTables(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
    });
};

exports.putItem = function (params) {
    var docClient = new aws.DynamoDB.DocumentClient();
    docClient.put(params, function (err, data) {
        if (err) {
            console.log("Fail, Error: \n" + err);
        }
        else {
            console.log("Success");
        }
    });
};

exports.queryItem = function (params){
    var docClient = new aws.DynamoDB.DocumentClient();
    docClient.query(params, function(err, data){
        if (err) console.log("Query error: \n" + err);
        else     console.log("Query success: " + JSON.stringify(data,null,2));
    });
};