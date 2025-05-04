const express = require('express');
const router = express.Router();
const { createRecipe,
        getallRecipes,
        getRecipeById,
        updaterecipe,
        deleterecipe, 
        getUserRecipes,
        toggleLikeRecipe,
        addComment,
        addReview,
        searchRecipes }  = require('../controllers/recipeController');

const auth  = require('../middleware/authMiddleware');
const isRecipeOwner = require('../middleware/isRecipeOwner');



// search recipes
router.get('/search', searchRecipes);


router.post('/', auth, createRecipe);
router.get('/'  , getallRecipes);
router.get('/:id', getRecipeById);  


// get all recipes by user
router.get('/user/:id', auth, getUserRecipes);   
// update and delete a recipe
// only the owner of the recipe can update or delete it
router.put('/:id', auth, isRecipeOwner, updaterecipe);
router.delete('/:id', auth,isRecipeOwner, deleterecipe);


// toggle Like a recipe
router.post('/:id/like', auth, toggleLikeRecipe); 

// Add a comment to a recipe
router.post('/:id/comment', auth, addComment); 

 // Add a review to a recipe
router.post('/:id/review', auth, addReview);





module.exports = router;