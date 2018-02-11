
const express = require('express')
const path = require('path')

const app = express()

app.set('port', process.env.port || 3000)

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res, next) => {
    res.render('index')
})

app.listen(app.get('port'), () => {
    console.log('App started on port', app.get('port'))
})
