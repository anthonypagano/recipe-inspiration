'use strict';

const RECIPE_API_URL = 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients';

function getRecipeNutritionURL(recipeId) {
  return `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${recipeId}/information`;
}

function getDataFromApi(searchTerm, callback) {
  const settings = {
    url: RECIPE_API_URL,
    data: {
        fillIngredients: false,
        ingredients: `${searchTerm}`,
        limitLicense: false,
        number: 5,
        ranking: 1      
    },
    dataType: 'json',
    type: 'GET',
    success: callback,
    beforeSend: function(xhr) {
    xhr.setRequestHeader("X-Mashape-Key", "HUIGKzUSuimshYq2Ik0AtYnAWLGIp1v98GXjsnQq7t3xOWZ7Pu");}
  };

  $.ajax(settings);
}

function displayRecipeSearchData(data) {
  const results = data.map((item, index) => renderResult(item));
  $('.js-search-results').html(results);
}

function renderResult(result) {
  return `
    <p><a href="https://spoonacular.com/recipes/${result.title}-${result.id}" target="_blank">${result.title}</a></p>
    <p><a href="https://spoonacular.com/recipes/${result.title}-${result.id}" target="_blank"><img src="${result.image}" alt="${result.title}" height="75" width="75" /></a></p>
    <button type="submit" id="${result.id}" class="nutrition-button" onClick="handleOnClickNutritionButton(${result.id})">Is this recipe vegan, vegeterian or gluten free?</button>
    <section class="js-nutrition-results-${result.id}">
      
    </section>
  `;
}

function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    const query = queryTarget.val();
    queryTarget.val("");
    getDataFromApi(query, displayRecipeSearchData);
  });
}

$(watchSubmit);

function getNutritionData(recipeId, callback) {
  const nutritionInfo = {
    url: getRecipeNutritionURL(recipeId),
    data: {
      includeNutrition: true
    },
    dataType: 'json',
    type: 'GET',
    success: function(data) { 
      let healthCheck = Object.values(data);
      callback(recipeId, healthCheck); 
    },
    beforeSend: function(xhr) {
    xhr.setRequestHeader("X-Mashape-Key", "HUIGKzUSuimshYq2Ik0AtYnAWLGIp1v98GXjsnQq7t3xOWZ7Pu");}
  };

  $.ajax(nutritionInfo);
}

function displayNutritionInfo(recipeId, healthCheck) {
  const results = renderNutrition(healthCheck);
  $('.js-nutrition-results-' + recipeId).html(results);
}

function renderNutrition(result) {
    if (result[0] == true) {
      return `
        <h3>This recipe is Vegeterian</h3>
      `;
    }
    if (result[1] == true) {
      return `
        <h3>This recipe is Vegan</h3>
      `;
    }
    if (result[2] == true) {
      return `
        <h3>This recipe is Gluten Free</h3>
      `;
    }    
    if (result[0] == false &&
        result[1] == false &&
        result[2] == false) {
      return `
        <h3>I'm sorry, this recipe is not Vegeterian, Vegan, or Gluten Free</h3>
      `;
    }
}
function handleOnClickNutritionButton(recipeId) {
    getNutritionData(recipeId, displayNutritionInfo);
    $('#' + recipeId).hide();  
}
