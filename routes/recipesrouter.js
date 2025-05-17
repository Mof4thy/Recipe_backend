const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();
const {
  createRecipe,
  getallRecipes,
  getRecipeById,
  updaterecipe,
  deleterecipe,
  getUserRecipes,
  toggleLikeRecipe,
  toggleSaveRecipe,
  getSavedRecipes,
  addComment,
  addReview,
  searchRecipes,
} = require("../controllers/recipeController");

const auth = require("../middleware/authMiddleware");
const isRecipeOwner = require("../middleware/isRecipeOwner");

// search recipes
router.get("/search",auth, searchRecipes);

router.post("/", auth, createRecipe);
router.get("/",auth, getallRecipes);

// toggle save recipe
router.post("/save/:id", auth, toggleSaveRecipe);
// get saved recipes
router.get("/saved", auth, getSavedRecipes);
router.post("/add", auth, upload.single("image"), createRecipe);


router.get("/:id", auth, getRecipeById);

// get all recipes by user
router.get("/user/:id", auth, getUserRecipes);
// update and delete a recipe
// only the owner of the recipe can update or delete it
router.put("/:id", auth, isRecipeOwner, upload.single("image"), updaterecipe);
router.delete("/:id", auth, isRecipeOwner, deleterecipe);

// toggle Like a recipe
router.post("/:id/like", auth, toggleLikeRecipe);

// Add a comment to a recipe
router.post("/:id/comment", auth, addComment);

// Add a review to a recipe
router.post("/:id/review", auth, addReview);

module.exports = router;
