'use strict';

//main recipe api
const RECIPE_API_URL = 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients';

//additional nutrition related endpoint
function getRecipeNutritionURL(recipeId) {
  return `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${recipeId}/information`;
}

//Returns data from the api based on ingredients entered by the user and other params
function getDataFromApi(searchTerm, callback) {
  const settings = {
    url: RECIPE_API_URL,
    data: {
        fillIngredients: false,
        ingredients: `${searchTerm}`,
        limitLicense: false,
        number: 6,
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

//Takes formatted search results and populate them on screen for the user
function displayRecipeSearchData(data) {
  const results = data.map((item, index) => renderResult(item));
  $('.js-search-results').html(results);
}

//Takes returned results from api and show title, image and link them up. Also set up section and button for nutrition check using returned recipe id 
function renderResult(result) {
  return `
  <div class="recipe-tile">
    <p><a href="https://spoonacular.com/recipes/${result.title}-${result.id}" target="_blank" class="recipe-title">${result.title}</a></p>
    <p><a href="https://spoonacular.com/recipes/${result.title}-${result.id}" target="_blank"><img src="${result.image}" alt="${result.title}" class="recipe-image" /></a></p>
    <input type="button" value="Health Awareness" id="${result.id}" class="nutrition-button" onClick="handleOnClickNutritionButton(${result.id})">
    <section class="js-nutrition-results-${result.id}" aria-live="assertive">
    </section>
  </div>      
  `;
}

//Watches for a click on the search button and take users ingredients and feed them to the main api function
function watchSubmit() {
  $('.js-search-form').click(event => {
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    const query = queryTarget.val();
    getDataFromApi(query, displayRecipeSearchData);
  });
}

$(watchSubmit);

//Takes each search results id and return the nutrition info so users can check if the returned recipe is vegan, vegeterian and-or gluten free
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

//Takes formatted health awareness results and populate them on screen for the user
function displayNutritionInfo(recipeId, healthCheck) {
  const results = renderNutrition(healthCheck);
  $('.js-nutrition-results-' + recipeId).html(results);
}

//Looks at array and determine true-false values for vegan, vegeterian, gluten free, none of the above or all of the above answers 
function renderNutrition(result) {
    if (result[0] == true) {
      return `
        <h2 class="veganveg">&#x2713;&nbsp;This recipe is Vegeterian</h2>
      `;
    }
    if (result[1] == true) {
      return `
        <h2 class="veganveg">&#x2713;&nbsp;This recipe is Vegan</h2>
      `;
    }
    if (result[2] == true) {
      return `
        <h2 class="veganveg">&#x2713;&nbsp;This recipe is Gluten Free</h2>
      `;
    }    
    if (result[0] == false && result[1] == false && result[2] == false) {
      return `
        <h2 class="unhealthy">&#xd7;&nbsp;I'm sorry, this recipe is not Vegeterian, Vegan, or Gluten Free</h2>
      `;
    }
    if (result[0] == true && result[1] == true && result[2] == true) {
      return `
        <h2 class="veganveg">&#x2713;&nbsp;This recipe IS Vegeterian, Vegan, AND Gluten Free</h2>
    `;
  }    
}

//fires when the health awareness button is clicked, hides the button and takes the recipie id and passes it to the getNutritionData function
function handleOnClickNutritionButton(recipeId) {
    getNutritionData(recipeId, displayNutritionInfo);
    $('#' + recipeId).hide();  
}
