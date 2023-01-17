const express = require('express');
const app = express();

port = 9046;

app.listen(port, () => {
    console.log("serverny nyala, port - " + port)
});

app.use(express.static('public'));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.redirect('/home');
})

app.get('/home', (req, res) => {
    res.render('index.ejs')
})

app.get('/lmao', (req, res) => {
    res.render('lmao.ejs')
})