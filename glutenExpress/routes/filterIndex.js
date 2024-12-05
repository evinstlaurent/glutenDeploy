var express = require('express');
var dotenv = require('dotenv');
var dbPool = require('../public/javascripts/dbConnect');
var executeQuery = require('../public/javascripts/dbQuery');
var router = express.Router();
dotenv.config();

var listingsArray = [];

router.get('/', function(req, res) {
  res.render('filter', {listingsArray});
});

router.post('/', async function(req, res) {
  let {searchText, glutenFlag, categoryFilter} = req.body;

  req.body.searchText = req.body.searchText.trim();
  req.body.searchText = req.body.searchText.replace(/['"`=\[\]\{\}\(\)]/g, '');

  try {
    await populateList(req.body.searchText, req.body.glutenFlag, req.body.categoryFilter);
    res.render('filter', {listingsArray});
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

async function populateList(searchText, glutenFlag, categoryFilter) {
  listingsArray = [];
  try {
      if (glutenFlag != 'none') {
        glutenSection = `isGluten = '${glutenFlag}'`;
      } else {
        glutenSection = `isGluten != ''`;
      }

      if (categoryFilter != 'none') {
        productSection = `productCategory = '${categoryFilter}'`;
      } else {
        productSection = `productCategory != ''`;
      }

      if (searchText != '') {
        textSection = `(productName LIKE '%${searchText}%' OR brand LIKE '%${searchText}%' OR ingredientList LIKE '%${searchText}%')`;
      } else {
        textSection = `productName != ''`;
      }

      listingsArray = await executeQuery(dbPool, `SELECT * FROM gluten WHERE ${productSection} AND ${glutenSection} AND ${textSection}`);
  } catch(error) {
      console.log(error);
  }
}
