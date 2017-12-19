var AWS = require("aws-sdk");
var db = require("./dbRes");


var dynamodb = new AWS.DynamoDB();

var UserTable = {
    TableName : "Users",
    KeySchema: [
        { AttributeName: "email", KeyType: "HASH"},  //Partition key
        { AttributeName: "pass", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "email", AttributeType: "S" },
        { AttributeName: "pass", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

var FilesTable = {
    TableName: "Files",
    KeySchema: [
        { AttributeName: "FileName", KeyType: "HASH" },
        { AttributeName: "Timestmap", KeyType: "RANGE" }

    ],
    AttributeDefinitions: [
        { AttributeName: 'FileName', AttributeType: "S" },
        { AttributeName: "Timestmap", AttributeType: "N" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

db.createTable(FilesTable);
