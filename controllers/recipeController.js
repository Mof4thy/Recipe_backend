const Recipe = require("../models/recipeModel");
const mongoose = require("mongoose");
const User = require("../models/User");

// route:   POST /api/recipes/add
// Create a new recipe
// private (auth middleware required)
// param   title, description, ingredients, steps, image, cuisine, cookingTime, nutritionalFacts
// param   userId (from auth middleware)
const createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      ingredients,
      steps,
      cuisine,
      cookingTime,
      nutritionalFacts,
    } = req.body;
    const userId = req.user._id;

    if (!title || !ingredients?.length || !steps?.length) {
      return res
        .status(400)
        .json({ message: "Title, ingredients, and steps are required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const recipe = await Recipe.create({
      user: userId,
      title,
      description,
      ingredients,
      steps,
      image,
      cuisine,
      cookingTime,
      nutritionalFacts,
    });

    res.status(201).json({ message: "Recipe created successfully", recipe });
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  route:   GET /api/recipes
//  Get all recipes
//  public
//  param   userId (from auth middleware)
//  param   recipeId (from request params)
const getallRecipes = async (req, res) => {
  try {
    const userId = req.user?._id;
    const recipes = await Recipe.find({}).populate("user", "name email");
    console.log("REC", recipes);
    if (!recipes) {
      return res.status(404).json({ message: "No recipes found" });
    }
    let savedRecipes = [];
    let following = [];
    if (userId) {
      const user = await User.findById(userId);
      savedRecipes = user.savedRecipes.map((id) => id.toString());
      following = user.following.map((id) => id.toString());
    }

    const recipesWithSaveStatus = recipes.map((recipe) => {
      const recipeObj = recipe.toObject();
      recipeObj.isSaved = savedRecipes.includes(recipe._id.toString());

      // Add isFollowed status to the user object
      if (recipeObj.user && userId) {
        recipeObj.user.isFollowed = following.includes(
          recipeObj.user._id.toString()
        );
      }

      console.group("Processed", recipeObj);

      return recipeObj;
    });

    res.status(200).json(recipesWithSaveStatus);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// route:   GET /api/recipes/?id=recipeId
// Get a recipe by ID
// public
// param   recipeId (from request params)
// param   userId (from auth middleware)
const getRecipeById = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user?._id;
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    const recipe = await Recipe.findById(recipeId)
      .populate("user", "username email")
      .populate("comments.user", "name email age") // Include full user details for comments
      .populate("reviews.user", "username");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const response = recipe.toObject();
    if (userId) {
      const user = await User.findById(userId);
      response.isSaved = user.savedRecipes.includes(recipe._id);

      // Add isFollowed status
      if (response.user && userId.toString() !== response.user._id.toString()) {
        const following = user.following.map((id) => id.toString());
        response.user.isFollowed = following.includes(
          response.user._id.toString()
        );
      }
    } else {
      response.isSaved = false;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  route:  PUT /api/recipes/:id
//  Update a recipe by ID
//  private (auth middleware required)
//  param   recipeId, updatedFields (from request body)
//  param   userId (from auth middleware)
const updaterecipe = async (req, res) => {
  try {
    const updatedFields = req.body;
    const recipeId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this recipe" });
    }

    if (req.file) {
      updatedFields.image = `/uploads/${req.file.filename}`;
    }

    Object.assign(recipe, updatedFields);
    const updatedRecipe = await recipe.save();

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// route:   DELETE /api/recipes/:id
// Delete a recipe by ID
// private (auth middleware required)
// param   recipeId
const deleterecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this recipe" });
    }

    await recipe.deleteOne();

    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// route:   GET /api/recipes/user/:id
// Get all recipes by user ID
// private (auth middleware required)
// param   userId
const getUserRecipes = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const recipes = await Recipe.find({ user: userId }).populate(
      "user",
      "name email"
    );

    if (!recipes || recipes.length === 0) {
      return res
        .status(404)
        .json({ message: "No recipes found for this user" });
    }

    let savedRecipes = [];
    let following = [];
    const currentUserId = req.user._id;

    if (currentUserId) {
      const user = await User.findById(currentUserId);
      savedRecipes = user.savedRecipes.map((id) => id.toString());
      following = user.following.map((id) => id.toString());
    }

    const recipesWithSaveStatus = recipes.map((recipe) => {
      const recipeObj = recipe.toObject();
      recipeObj.isSaved = savedRecipes.includes(recipe._id.toString());

      // Add isFollowed status to user object
      if (recipeObj.user && currentUserId) {
        recipeObj.user.isFollowed = following.includes(
          recipeObj.user._id.toString()
        );
      }

      return recipeObj;
    });

    res.status(200).json(recipesWithSaveStatus);
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// route:   POST /api/recipes/:id/like
// Toggle like status for a recipe
// private (auth middleware required)
// param   recipeId
// param   userId (from auth middleware)
const toggleLikeRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    const alreadyliked = recipe.likes.includes(userId);
    if (alreadyliked) {
      // Already liked → remove user like using id
      recipe.likes = recipe.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Not liked → add user like
      recipe.likes.push(userId);
    }

    await recipe.save();

    res.status(200).json({
      message: alreadyliked ? "Recipe unliked" : "Recipe liked",
      likes: recipe.likes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// route:   POST /api/recipes/:id/comments
// Add a comment to a recipe
// private (auth middleware required)
// param   recipeId, text
// reqbody text

const addComment = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { text } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const comment = {
      user: userId,
      text,
    };

    recipe.comments.push(comment);
    await recipe.save();

    // Fetch the comment with populated user data
    const updatedRecipe = await Recipe.findById(recipeId).populate(
      "comments.user",
      "name email age"
    );
    const addedComment =
      updatedRecipe.comments[updatedRecipe.comments.length - 1];

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: addedComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add a rating and review to a recipe
// route :  POST /api/recipes/:id/review
// Private
// param   recipeId
// reqbody {rating , review}
const addReview = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { rating, review } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // get recipe
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user already reviewed this recipe
    const alreadyReviewed = recipe.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You already reviewed this recipe" });
    }

    const newReview = {
      user: userId,
      rating: Number(rating),
      review,
    };

    recipe.reviews.push(newReview);
    await recipe.save();

    res.status(201).json({
      message: "Review added successfully",
      newReview,
      averageRating: recipe.averageRating,
      totalReviews: recipe.totalReviews,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// route   GET /api/recipes/search/
// Search only:
// /api/recipes/search?keyword=pasta

// Filter only:
// /api/recipes/search?cuisine=Italian&maxCookingTime=30

// Combined search and filter:
// /api/recipes/search?keyword=pasta&cuisine=Italian&maxTime=30
///api/recipes/search?keyword=pasta&cuisine=Italian&ingredients=tomato,basil&maxCookingTime=30

//     Search recipes by title, ingredients, or cuisine
//     public
// param :  title, ingredients, cuisine (from query params)
const searchRecipes = async (req, res) => {
  try {
    let { keyword, cuisine, ingredients, maxCookingTime } = req.query;
    const userId = req.user?._id;

    const filters = {};

    keyword = keyword?.toLowerCase();
    cuisine = cuisine?.toLowerCase();
    ingredients = ingredients?.toLowerCase();

    // Keyword search in title, description, or cuisine
    if (keyword) {
      filters.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { cuisine: { $regex: keyword, $options: "i" } },
      ];
    }

    // Cuisine match (case-insensitive)
    if (cuisine) {
      filters.cuisine = { $regex: cuisine, $options: "i" };
    }

    // Ingredients filtering (case-insensitive, multiple ingredients)
    if (ingredients) {
      const ingredientArray = ingredients
        .split(",")
        .map((item) => item.trim().toLowerCase());

      filters["ingredients.category"] = {
        $in: ingredientArray.map((ingredient) => new RegExp(ingredient, "i")),
      };
    }

    // Cooking time filter
    if (maxCookingTime) {
      filters.cookingTime = { $lte: parseInt(maxCookingTime) };
    }

    const recipes = await Recipe.find(filters)
      .populate("user", "name email")
      .populate("comments.user", "name email age")
      .populate("reviews.user", "name");

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: "No recipes found" });
    }

    let savedRecipes = [];
    let following = [];
    if (userId) {
      const user = await User.findById(userId);
      savedRecipes = user.savedRecipes.map((id) => id.toString());
      following = user.following.map((id) => id.toString());
    }

    const recipesWithSaveStatus = recipes.map((recipe) => {
      const recipeObj = recipe.toObject();
      recipeObj.isSaved = savedRecipes.includes(recipe._id.toString());

      // Add isFollowed status to the user object
      if (recipeObj.user && userId) {
        recipeObj.user.isFollowed = following.includes(
          recipeObj.user._id.toString()
        );
      }

      return recipeObj;
    });

    res.status(200).json(recipesWithSaveStatus);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Save or unsave a recipe
//  route   POST /api/users/save/:id
//  Private
const toggleSaveRecipe = async (req, res) => {
  try {
    const userId = req.user._id;
    const recipeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadySaved = user.savedRecipes.includes(recipeId);
    if (alreadySaved) {
      user.savedRecipes = user.savedRecipes.filter(
        (id) => id.toString() !== recipeId.toString()
      );
    } else {
      user.savedRecipes.push(recipeId);
    }
    await user.save();

    res.status(200).json({
      message: alreadySaved ? "Recipe unsaved" : "Recipe saved",
      savedRecipes: user.savedRecipes,
    });
  } catch (error) {
    console.error("Toggle save error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get all saved recipes for a user
//  route:   GET /api/users/saved
//  Private
const getSavedRecipes = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "savedRecipes",
      populate: {
        path: "user",
        select: "name email _id",
      },
    });

    // Get user's following list
    const following = user.following.map((id) => id.toString());

    // Add isSaved flag to each recipe
    const recipesWithSaveStatus = user.savedRecipes.map((recipe) => {
      const recipeObj = recipe.toObject();
      recipeObj.isSaved = true;

      // Add isFollowed status to the recipe author
      if (
        recipeObj.user &&
        userId.toString() !== recipeObj.user._id.toString()
      ) {
        recipeObj.user.isFollowed = following.includes(
          recipeObj.user._id.toString()
        );
      }

      return recipeObj;
    });

    res.json(recipesWithSaveStatus);
  } catch (error) {
    console.error("Get saved recipes error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
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
};
