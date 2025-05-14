const express= require('express')
const router = express.Router()
const { 
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
    getFollowing } = require('../controllers/userController');

const auth = require('../middleware/authMiddleware')




// register a new user
router.post('/register', CreateUser)
// login a user
router.post('/login', LoginUser)    
// Get user profile
 router.get('/profile', auth ,getUserProfile) 




// meal plan routes
router.post('/meal-plan', auth, addMealToPlan);     // Add/update a day's meal
router.get('/meal-plan', auth, getMealPlan);         // View full week's plan
router.delete('/meal-plan', auth, clearMealPlan);    // Clear by day or all



// GET ShoppingList 
router.get('/shoppinglist', auth, getShoppingList);




// follow and unfollow oass user id to follow in the body
router.post('/follow', auth, followUser);
router.post('/unfollow', auth, unfollowUser);


// get followers and following by user id
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);





module.exports = router;

