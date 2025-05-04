# 🍽️ Recipe & Meal Planning Backend API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A RESTful API backend for a Recipe & Meal Planning application built with Node.js, Express, and MongoDB. Handles user authentication, recipe management, meal planning, and social features.

## Features

- 🔐 JWT Authentication & Authorization
- 📋 CRUD Operations for Recipes
- 🗓 Weekly Meal Planning System
- 🛒 Automated Shopping List Generation
- 👥 User Social Features (Follow/Unfollow)
- 📤 Local Image Upload Support
- 💾 Save/Like Favorite Recipes

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **Environment Management**: dotenv

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas URI or local MongoDB instance
- npm

### Installation

1. Clone the repository:
```bash

git clone https://github.com/your-username/recipe_backend.git
cd recipe_backend

```
Install dependencies:
```
bash
npm install

```
Environment Variables
Create .env file in root directory with following variables:
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/recipe_app
JWT_SECRET=your_jwt_secret_key

```
Start the development server:
```
bash
npm run dev
```

	
