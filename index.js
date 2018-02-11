
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const Team = require('./db').Team;

const app = express()
app.set('port', process.env.port || 3000)
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res, next) => {
    res.render('index')
})

app.get('/team', (req, res, next) => {
    Team.all( (err, data) => {
        if (err) return next(err)
        res.send(data)
    })
})

app.post('/team', (req, res, next) => {
    Team.create(
        {
            apiID: req.body.apiID,
            fullname: req.body.fullname,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            position: req.body.position,
            pro_team: req.body.pro_team,
            photo: req.body.photo
        },
        (err) => {
            if (err) {
                return next(err)
            }
            res.send('OK')
    })
})

app.delete('/team/:id', (req, res, next) => {
    const id = req.params.id
    Team.delete(id, (err) => {
        if (err) {
            return next(err)
        }
        res.send('OK')
    });
});

app.listen(app.get('port'), () => {
    console.log('App started on port', app.get('port'))
})
