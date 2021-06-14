const express = require('express')
const app = express()
const connectDB = require('./config/db')


// Connect DB

connectDB()

//Init middleWare

app.use(express.json())  //это метод, встроенный в express для распознавания входящего объекта запроса как объекта JSON. Этот метод вызывается в качестве промежуточного программного обеспечения в вашем приложении с использованием кода


app.get('/', (req, res)=> res.send('API running'))


//Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes//api/auth'))

const PORT = process.env.PORT || 5000

app.listen(PORT,()=> console.log(`Server has been started on PORT ${PORT}`))