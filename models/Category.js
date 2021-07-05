const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CategorySchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    color:{
        type:String,
        enum:['color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color7', 'color8'],
        description: "can only be one of the enum values"
    },
    title:{
        type:String,
        required: true
    }

});












module.exports = mongoose.model('category', CategorySchema);