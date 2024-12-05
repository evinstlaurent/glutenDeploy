var express = require('express');
var dotenv = require('dotenv');
var {OpenAI} = require('openai');
var dbPool = require('../public/javascripts/dbConnect');
var executeQuery = require('../public/javascripts/dbQuery');
var router = express.Router();
dotenv.config();

var listingsArray = [];

populateList();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async function(req, res) {
  let {productName, ingredients, category, brand} = req.body;

  req.body.productName = req.body.productName.trim();
  req.body.ingredients = req.body.ingredients.trim();
  req.body.brand = req.body.brand.trim();
  req.body.productName = req.body.productName.replace(/['"`]/g, '');
  req.body.ingredients = req.body.ingredients.replace(/['"`]/g, '');
  req.body.brand = req.body.brand.replace(/['"`]/g, '');
  var ingredientSubmission = req.body.ingredients.replace(/[\[\]\{\}\(\)]/g, ',');

  const prompt = "Does any of the following ingredients contain gluten or have any chance of containing gluten:"+ingredientSubmission+"If any of them do, only return the ingredient names separated by commas and nothing else. If no ingredients contain gluten, return None and nothing else.";

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    var glutenIng = response.choices[0].message.content;
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating response');
  }

  var productData = processFormData(req.body, glutenIng);

  try {
    await executeQuery(dbPool, `INSERT INTO gluten (productName, glutenIngredientsList, productCategory, brand, ingredientList, isGluten) VALUES ('${productData.name}', '${productData.glutenIngredients}', '${productData.category}', '${productData.brand}', '${productData.allIngredients}', '${productData.glutenTag}')`);
    await populateList();
    res.render('index', {listingsArray});
  } catch(error) {
    console.log(error);
  }
});

router.get('/', function(req, res) {
  res.render('index', {listingsArray});
});

module.exports = router;

function processFormData(body, glutenIng) {
  let glutenYes = 'gluten';
  if (String(glutenIng) === 'None') {
    glutenYes = 'noGluten';
  }

  const productData = {
    name: body.productName,
    glutenIngredients: glutenIng.split(','),
    allIngredients: body.ingredients,
    glutenTag: glutenYes,
    category: body.category,
    brand: body.brand,
  };

  return productData;
}

async function populateList() {
  try {
      listingsArray = await executeQuery(dbPool, `SELECT * FROM gluten`);
      //executeQuery(dbPool, "DELETE FROM gluten WHERE id = 26");
      //console.log(listingsArray);
  } catch(error) {
      console.log(error);
  }
}



// await console.log(executeQuery(dbPool, `INSERT INTO gluten (productName, ingredientList, productCategory, brand, glutenIngredientsList, isGluten) VALUES ('${productData.name}', '${productData.glutenIngredients}', '${productData.category}', '${productData.brand}', '${productData.allIngredients}', '${productData.glutenTag}')`).then(function(result) {
// console.log(result);}
// ));

