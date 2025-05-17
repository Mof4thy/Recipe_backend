const User = require("../models/User");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const Recipe = require("../models/recipeModel");

const generateToken = (user) => {
  const token = jsonwebtoken.sign(
    { id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return token;
};

// route:   POST /api/auth/register
const CreateUser = async (req, res) => {
  const { name, email, password, age } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
    });
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      message: "User created successfully",
      ...userObj,
    });
  } catch (error) {
    console.error("User creation failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// route   POST /api/auth/login
const LoginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const userObj = user.toObject();

    delete userObj.password;

    // Add token
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      ...userObj,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  function to validate recipe ID
const isValidRecipeId = async (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return false;
  const recipe = await Recipe.findById(id);
  return !!recipe;
};

// Add or update a meal to the meal plan for a specific day
// route: POST /api/users/meal-plan
// Private
const addMealToPlan = async (req, res) => {
  try {
    const { day, meals } = req.body; // meals: { breakfast, lunch, dinner, snacks }
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Validate each recipe ID if provided
    const { breakfast, lunch, dinner, snacks } = meals;
    if (
      (breakfast && !(await isValidRecipeId(breakfast))) ||
      (lunch && !(await isValidRecipeId(lunch))) ||
      (dinner && !(await isValidRecipeId(dinner))) ||
      (snacks && !(await isValidRecipeId(snacks)))
    ) {
      return res
        .status(400)
        .json({ message: "One or more meal IDs are invalid." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const mealPlanEntry = user.mealPlan.find((meal) => meal.day === day);
    if (mealPlanEntry) {
      mealPlanEntry.meals = meals; // Update
    } else {
      user.mealPlan.push({ day, meals }); // Add
    }

    await user.save();
    res.json({
      message: "Meal plan updated successfully",
      mealPlan: user.mealPlan,
    });
  } catch (error) {
    console.error("Add meal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get the meal plan for the week
//  route:   GET /api/users/meal-plan
//  Private
const getMealPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.user._id)
      .populate("mealPlan.meals.breakfast")
      .populate("mealPlan.meals.lunch")
      .populate("mealPlan.meals.dinner")
      .populate("mealPlan.meals.snacks");

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.mealPlan || user.mealPlan.length === 0) {
      return res
        .status(404)
        .json({ message: "No meal plan found for this user" });
    }

    res.json(user.mealPlan);
  } catch (error) {
    console.error("Get meal plan error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Clear the meal for specific day or all meals plan for the user
//  route:   DELETE /api/users/meal-plan
//  Private
const clearMealPlan = async (req, res) => {
  try {
    const { day, category } = req.body; 
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!day) {
      user.mealPlan = [];
      await user.save();
      return res.json({
        message: "Meal plan cleared successfully",
        category: user.category,
      });
    }
    
    if (day && !category) {
      user.mealPlan = user.mealPlan.filter((meal) => meal.day !== day);
      await user.save();
      return res.json({
        message: `Meal plan for ${day} cleared successfully`,
        mealPlan: user.mealPlan,
      });
    }

    if (day && category) {
      const mealPlanDay = user.mealPlan.find((meal) => meal.day === day);
      
      if (!mealPlanDay) {
        return res.status(404).json({ message: `No meal plan found for ${day}` });
      }

      if (!['breakfast', 'lunch', 'dinner', 'snacks'].includes(category)) {
        return res.status(400).json({ 
          message: "Invalid meal type. Must be breakfast, lunch, dinner, or snacks" 
        });
      }

      if (mealPlanDay.meals[category]) {
        mealPlanDay.meals[category] = null;
        await user.save();
        return res.json({
          message: `${category} for ${day} cleared successfully`,
          category: user.category,
        });
      } else {
        return res.status(404).json({ message: `No ${mealType} found for ${day}` });
      }
    }

    await user.save();
    res.json({
      message: "Meal plan updated successfully",
      mealPlan: user.mealPlan,
    });
  } catch (error) {
    console.error("Clear meal plan error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get the shopping list based on the meal plan
//  route:   GET /api/users/shopping-list
//  Private
const getShoppingList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("mealPlan.meals.breakfast")
      .populate("mealPlan.meals.lunch")
      .populate("mealPlan.meals.dinner")
      .populate("mealPlan.meals.snacks");

    if (!user) return res.status(404).json({ message: "User not found" });

    const categorizedIngredients = {};

    // Loop through each day's meal plan
    for (let i = 0; i < user.mealPlan.length; i++) {
      const meals = user.mealPlan[i].meals;
      const allMeals = [
        meals.breakfast,
        meals.lunch,
        meals.dinner,
        meals.snacks,
      ].filter(Boolean);

      // Loop through each recipe in the meals
      for (let j = 0; j < allMeals.length; j++) {
        const recipe = allMeals[j];

        for (let k = 0; k < recipe.ingredients.length; k++) {
          const ingredient = recipe.ingredients[k];
          const nameKey = ingredient.name.toLowerCase();
          const category = ingredient.category || "Other";

          // Initialize the category if it doesn't exist
          if (!categorizedIngredients[category]) {
            categorizedIngredients[category] = {};
          }

          // If the ingredient is already in the map, combine quantities
          if (categorizedIngredients[category][nameKey]) {
            categorizedIngredients[category][nameKey].quantity.push(
              ingredient.quantity
            );
          } else {
            categorizedIngredients[category][nameKey] = {
              name: ingredient.name,
              quantity: [ingredient.quantity],
            };
          }
        }
      }
    }

    // Build the response array sorted by category
    const shoppingList = Object.entries(categorizedIngredients)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, items]) => ({
        category,
        items: Object.values(items).map((item) => ({
          name: item.name,
          quantity: item.quantity.length,
        })),
      }));

    res.json({ shoppingList });
  } catch (error) {
    console.error("Get shopping list error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Follow a user
// @route:  POST /api/users/follow/:id
// Private

const followUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.followers.includes(currentUserId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    targetUser.followers.push(currentUserId);
    currentUser.following.push(targetUserId);

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Unfollow a user
//  route:  POST /api/users/unfollow/:id
//  Private
const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!targetUser.followers.includes(currentUserId)) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//   Get list of followers for a user
//  route:   GET /api/users/:id/followers
//  Public or Private (your choice)
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name email"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ followers: user.followers });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get list of users this user is following
// route:   GET /api/users/:id/following
// Public or Private (your choice)
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "name email"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ following: user.following });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  CreateUser,
  LoginUser,
  getUserProfile,
  addMealToPlan,
  getMealPlan,
  clearMealPlan,
  getShoppingList,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
