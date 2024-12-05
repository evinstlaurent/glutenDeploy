// const mysql2 = require('mysql2');
// var dbPool = require('./dbConnect');
// var executeQuery = require('./dbQuery');

async function sendIngredientsToAI(prompt) {
  const apiKey = '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';
  const xmlRequest = new XMLHttpRequest();
  xmlRequest.open('POST', 'https://api.openai.com/v1/chat/completions', true);

  return new Promise((resolve, reject) => {
    xmlRequest.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xmlRequest.setRequestHeader('Content-Type', 'application/json');
  
    xmlRequest.onreadystatechange = function() {
      if (xmlRequest.readyState === 4) {  
        if (xmlRequest.status === 200) {
          const response = JSON.parse(xmlRequest.responseText);
          //console.log(response.choices[0].message.content);
          resolve(response.choices[0].message.content);
        } else {
          reject(new Error(xmlRequest.statusText));
        }
      }
    };
  
    const requestBody = JSON.stringify({
      model: 'gpt-3.5-turbo',  
      messages: [{ role: 'user', content: prompt }]
    });
  
    xmlRequest.send(requestBody);
  });
}


document.addEventListener('DOMContentLoaded', (event) => {
  
  const productForm = document.getElementById('product-form');
  const productList = document.getElementById('product-list');


  function createProductCard(productData) {
    const card = document.createElement('div');
    card.classList.add('product-card');

    if (productData.glutenTag === 'Gluten') {
      card.classList.add('product-entry-gluten');
    } else if (productData.glutenTag = 'noGluten') {
      card.classList.add('product-entry-free');
    }

    const productName = document.createElement('h3');
    productName.textContent = productData.name;
    card.appendChild(productName);

    const glutenIngredientLabel = document.createElement('h4');
    glutenIngredientLabel.textContent = `Gluten-Containing Ingredients:`;
    card.appendChild(glutenIngredientLabel);

    const ingredientsList = document.createElement('ul');
    productData.glutenIngredients.forEach(ingredient => {
      const ingredientItem = document.createElement('li');
      ingredientItem.textContent = ingredient;
      ingredientsList.appendChild(ingredientItem);
    });
    card.appendChild(ingredientsList);

    const category = document.createElement('p');
    category.textContent = `Category: ${productData.category}`;
    card.appendChild(category);

    const brand = document.createElement('p');
    brand.textContent = `Brand: ${productData.brand}`;
    card.appendChild(brand);


    const fullIngredientLabel = document.createElement('h5');
    fullIngredientLabel.textContent = `All Ingredients:`;
    card.appendChild(fullIngredientLabel);
    const fullIngredientList = document.createElement('p');
    fullIngredientList.textContent = productData.allIngredients;
    card.appendChild(fullIngredientList);

    // const photo = document.createElement('img');
    // photo.src = productData.photo;
    // card.appendChild(photo);

    return card;
  }

  productForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    processFormData();

  });

  async function processFormData() {
    try {      
      const formData = new FormData(productForm);

      const glutenIng = await sendIngredientsToAI("Does any of the following ingredients contain gluten or have any chance of containing gluten:"+formData.get('ingredients')+"If any of them do, only return the ingredient names separated by commas and nothing else. If no ingredients contain gluten, return None and nothing else.");
      let glutenYes = 'Gluten';
      if (String(glutenIng) === 'None') {
        glutenYes = 'noGluten';
      }

      const productData = {
        name: formData.get('productName'),
        glutenIngredients: glutenIng.split(','),
        allIngredients: formData.get('ingredients'),
        glutenTag: glutenYes,
        category: formData.get('category'),
        brand: formData.get('brand'),
        //photo: URL.createObjectURL(formData.get('photo'))
      };

      // await console.log(executeQuery(dbPool, `INSERT INTO gluten (productName, ingredientList, productCategory, brand, glutenIngredientsList, isGluten) VALUES ('${productData.name}', '${productData.glutenIngredients}', '${productData.category}', '${productData.brand}', '${productData.allIngredients}', '${productData.glutenTag}')`).then(function(result) {
      // console.log(result);}
      // ));

      const card = createProductCard(productData);
      productList.appendChild(card);

      
      productForm.reset();

    } catch (error) {
      console.error(error);
    }
  }
  
});

//module.exports