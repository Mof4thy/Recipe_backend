    const mongoose = require('mongoose')
const validator = require('validator')


const userschema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("must be email format")
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            validate(value) {
                var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
                if (!strongRegex.test(value)) {
                    throw new Error("weak password");
                }
            }
        },
        age: {
            type: Number,
            default: 18,
            validate(value) {
                if (value <= 0) {
                    throw new Error("unvalid age")
                }
            }
        },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],

        mealPlan: [
            {
              day: { type: String, required: true }, 
              meals: {
                breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
                lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
                dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
                snacks: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
              },
            }
          ],
        
    },
    { timestamps: true }
)


module.exports = mongoose.model("User", userschema);
