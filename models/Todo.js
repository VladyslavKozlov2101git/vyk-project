const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TodoSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    createDate:{
        type: Date,
        default: Date.now
    }, // дата створення таска
    doDate:{
        type: Date
    }, // дата виконання
    title:{
        type:String,
        required: true,
        max: 10
    }, //Заголовок
    description:{
        type:String,
        text : true,
        required: true
    }, //Опис
    isImportant:{
        type:Boolean
    },//Важливість
    priority:{
        type:String,
        enum:['low', 'medium', 'hight'],
        description: "can only be one of the enum values"
    }, //Пріоритет
    isDone:{
        type:Boolean
    }, // Виконано
    category:{
        type: String,
        required: true

    }




  
});

module.exports = mongoose.model('todo', TodoSchema);