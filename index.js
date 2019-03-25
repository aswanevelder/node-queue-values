let environment = require('./config/environment');
const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');

exports.handler = (params) => {
    if (params) {
        environment = params;
    }

    MongoClient.connect(environment.STORE_DBURL, function (err, client) {
        if (err)
            console.error(err.message);

        const db = client.db(environment.STORE_DBNAME);
        const collectionFrom = db.collection(environment.STORE_COLLECTIONFROM);
        const collectionTo = db.collection(environment.STORE_COLLECTIONTO);


        collectionTo.deleteMany({}).then(async () => {
            try {
                const toArray = await collectionFrom.find({}, { _id: 0 }).toArray();
                await collectionTo.insertMany(toArray);
                await collectionTo.createIndex({ imei: 1 });
                console.log("Waiting for DB to complete.");
                setTimeout(() => { client.close(); console.log("Done"); }, 10000);
            }
            catch (err) {
                console.log(err);
            }
        })
    });
}

exports.handler({
    STORE_DBURL: process.env.STORE_DBURL,
    STORE_DBNAME: process.env.STORE_DBNAME,
    STORE_COLLECTIONFROM: 'device',
    STORE_COLLECTIONTO: 'devicereset',
});