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
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 }
  },
  
  { timestamps: true }
);

// Calculate average rating before saving
recipeSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
    this.totalReviews = this.reviews.length;
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
  }
  next();
});

module.exports = mongoose.model('Recipe', recipeSchema);
