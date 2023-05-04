import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// if (module.hot) {
//   module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0)Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //1)Обновление отображения закладок

    bookmarksView.update(model.state.bookmarks);

    //2)Загрузка рецепта

    await model.loadRecipe(id);

    //3) Отображение рецепта
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //Получение поисковых запросов
    const query = searchView.getQuery();
    if (!query) return;
    //Загрузка найденных результатов
    await model.loadSearchResults(query);

    //Отображение результата
    resultsView.render(model.getSearchResultsPage());
    // resultsView.render(model.state.search.results)

    //Отображение кнопок пагинации
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
const controlPagination = function (goToPage) {
  //Отображение новых результатов
  resultsView.render(model.getSearchResultsPage(goToPage));

  //Отображение изменённых кнопок пагинации
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Изменение порций (в состоянии)
  model.updateServings(newServings);

  //Изменение отображения рецепта
  // recipeView.render(model.state.recipe)//
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //Добавить или удалить закладку
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Обновить recipe view
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Спиннер
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Отображение рецепта
    recipeView.render(model.state.recipe);

    //Сообщение об успешной отправке
    addRecipeView.renderMessage();

    //Отрисовка закладки
    bookmarksView.render(model.state.bookmarks);

    //Изменение id в url
    window.history.pushState(null, '',`#${model.state.recipe.id}`);

    //Закрытие модального окна
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('👎👎👎', err);
    addRecipeView.renderError(err.message);
  }

  //Загрузка данных нового рецепта
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
