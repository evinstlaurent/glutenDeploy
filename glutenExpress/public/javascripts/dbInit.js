var dbPool = require('./dbConnect');
var executeQuery = require('./dbQuery');

var listingsArray = []

async function populateList() {
    try {
        listingsArray = await executeQuery(dbPool, `SELECT * FROM gluten FOR JSON AUTO`);
    } catch(error) {
        console.log(error);
    }
}

populateList();

listingsArray = module.exports;