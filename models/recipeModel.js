const mongoose = require('mongoose')


const recipeSchema = new mongoose.Schema({

  
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: [
        {
          name: String,
          quantity: String,
          category: String, 
        }
      ],
    steps: [{ type: String }],
    image: { type: String }, // path
    cuisine: { type: String },
    cookingTime: { type: Number },
    nutritionalFacts: {
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments:[
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          text: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      reviews: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          rating: Number,
          review: String,
        },
      ],
  },
  
  { timestamps: true }
);


module.exports = mongoose.model('Recipe', recipeSchema);
