# Recipe App API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Authentication

### Register User
```http
POST /users/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "age": 25
}
```
**Response:**
```json
{
  "message": "User created successfully",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25,
  "_id": "user_id"
}
```

### Login User
```http
POST /users/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```
**Response:**
```json
{
  "message": "Login successful",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "jwt_token"
}
```

### Get User Profile
```http
GET /users/profile
```
**Headers:**
- Authorization: Bearer <token>

**Response:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25,
  "_id": "user_id"
}
```

## Recipes

### Create Recipe
```http
POST /recipes
```
**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "title": "Pasta Carbonara",
  "description": "Classic Italian pasta dish",
  "ingredients": [
    {
      "name": "Spaghetti",
      "quantity": "200g",
      "category": "Pasta"
    }
  ],
  "steps": ["Boil pasta", "Mix ingredients"],
  "image": "image_url",
  "cuisine": "Italian",
  "cookingTime": 30,
  "nutritionalFacts": {
    "calories": 500,
    "protein": 20,
    "fat": 15,
    "carbs": 60
  }
}
```

### Get All Recipes
```http
GET /recipes
```
**Response:**
```json
[
  {
    "_id": "recipe_id",
    "title": "Pasta Carbonara",
    "description": "Classic Italian pasta dish",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
    // ... other recipe fields
  }
]
```

### Get Recipe by ID
```http
GET /recipes/:id
```
**Response:**
```json
{
  "_id": "recipe_id",
  "title": "Pasta Carbonara",
  "description": "Classic Italian pasta dish",
  "ingredients": [...],
  "steps": [...],
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "likes": [],
  "comments": [],
  "reviews": [],
  "averageRating": 4.5,
  "totalReviews": 10
}
```

### Update Recipe
```http
PUT /recipes/:id
```
**Headers:**
- Authorization: Bearer <token>
- Content-Type: multipart/form-data

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "image": <file>,  // Optional: Upload a new image file
  "ingredients": [   // Optional: Update ingredients
    {
      "name": "Updated Ingredient",
      "quantity": "300g",
      "category": "Updated Category"
    }
  ],
  "steps": ["Updated step 1", "Updated step 2"],  // Optional: Update steps
  "cuisine": "Updated Cuisine",                   // Optional: Update cuisine
  "cookingTime": 45,                             // Optional: Update cooking time
  "nutritionalFacts": {                          // Optional: Update nutritional facts
    "calories": 600,
    "protein": 25,
    "fat": 20,
    "carbs": 70
  }
}
```

**Response:**
```json
{
  "_id": "recipe_id",
  "title": "Updated Title",
  "description": "Updated description",
  "image": "/uploads/new_image_filename.jpg",
  "ingredients": [...],
  "steps": [...],
  "cuisine": "Updated Cuisine",
  "cookingTime": 45,
  "nutritionalFacts": {...},
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "likes": [],
  "comments": [],
  "reviews": [],
  "averageRating": 4.5,
  "totalReviews": 10
}
```

### Delete Recipe
```http
DELETE /recipes/:id
```
**Headers:**
- Authorization: Bearer <token>

### Search Recipes
```http
GET /recipes/search
```
**Query Parameters:**
- `keyword`: Search in title, description, or cuisine
- `cuisine`: Filter by cuisine
- `ingredients`: Comma-separated list of ingredients
- `maxCookingTime`: Maximum cooking time in minutes

**Example:**
```
GET /recipes/search?keyword=pasta&cuisine=Italian&ingredients=tomato,basil&maxCookingTime=30
```

## Recipe Interactions

### Like/Unlike Recipe
```http
POST /recipes/:id/like
```
**Headers:**
- Authorization: Bearer <token>

### Add Comment
```http
POST /recipes/:id/comment
```
**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "text": "Great recipe!"
}
```

### Add Review
```http
POST /recipes/:id/review
```
**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "rating": 5,
  "review": "Excellent recipe!"
}
```

**Response:**
```json
{
  "message": "Review added successfully",
  "newReview": {
    "user": "user_id",
    "rating": 5,
    "review": "Excellent recipe!"
  },
  "averageRating": 4.5,
  "totalReviews": 10
}
```

## User Features

### Save/Unsave Recipe
```http
POST /recipes/save/:id
```
**Headers:**
- Authorization: Bearer <token>

### Get Saved Recipes
```http
GET /recipes/saved
```
**Headers:**
- Authorization: Bearer <token>

### Follow User
```http
POST /users/follow
```
**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "targetUserId": "user_id_to_follow"
}
```

### Unfollow User
```http
POST /users/unfollow
```
**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "targetUserId": "user_id_to_unfollow"
}
```

### Get User's Followers
```http
GET /users/:id/followers
```

### Get User's Following
```http
GET /users/:id/following
```

## Meal Planning

### Add/Update Meal Plan
```http
POST /users/meal-plan
```
**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "day": "Monday",
  "meals": {
    "breakfast": "recipe_id",
    "lunch": "recipe_id",
    "dinner": "recipe_id",
    "snacks": "recipe_id"
  }
}
```

### Get Meal Plan
```http
GET /users/meal-plan
```
**Headers:**
- Authorization: Bearer <token>

### Clear Meal Plan
```http
DELETE /users/meal-plan
```
**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "day": "Monday"  // Optional, if not provided clears entire meal plan
}
```

### Get Shopping List
```http
GET /users/shoppinglist
```
**Headers:**
- Authorization: Bearer <token>

**Response:**
```json
{
  "shoppingList": [
    {
      "category": "Vegetables",
      "items": [
        {
          "name": "Tomato",
          "quantity": "2 + 3"
        }
      ]
    }
  ]
}
```

## Error Responses
All endpoints may return the following error responses:

```json
{
  "message": "Error message",
  "error": "Detailed error information"
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error 