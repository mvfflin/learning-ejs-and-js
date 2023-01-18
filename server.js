const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();

port = 9046;

app.listen(port, () => {
    console.log("serverny nyala, port - " + port)
});

app.use(express.static('public'));
app.use(expressLayouts)
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('index', {
        title: 'hi!'
    })
});

app.get('/lmao', (req, res) => {
    res.render('lmao.ejs')
})