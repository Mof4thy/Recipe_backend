
const mongoose = require('mongoose');


const mealPlanSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        weekStartDate: { type: Date, required: true },
        days: [
          {
            date: Date,
            breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
            lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
            dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
            snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
          },
        ],
      },
      { timestamps: true }

)

module.exports = mongoose.model('MealPlan', mealPlanSchema);
