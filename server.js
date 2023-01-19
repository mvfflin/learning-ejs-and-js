const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const env = require('./env')
const app = express();

// delay function
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
// end of delay function

// database connect
async function database() {

    const {MongoClient} = require('mongodb');
    const mongouri = env.uri;
    const mongoclient = new MongoClient(mongouri)
    await delay(5)

    try {
        await mongoclient.connect();
        console.log('connected to db')
        await listDatabases(mongoclient);
    } catch (e) {
        console.error(e)
    } finally {
        await mongoclient.close();
    }
}

database().catch(console.error);

async function listDatabases(mongoclient) {
    databaseList = await mongoclient.db().admin().listDatabases()

    console.log("Databases:");
    databaseList.databases.forEach(db => console.log(` - ${db.name}`));
}
// end of database connect

port = 9046;

app.listen(port, () => {
    console.log("serverny nyala, port - " + port)
});

app.use(express.static('public'));
app.use(expressLayouts)
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('index', {
        layout: 'layouts/mainlayout',
        title: 'hi!'
    })
});

app.get('/list', (req, res) => {
    res.render('list', {
        layout: 'layouts/mainlayout',
        title: 'user list'
    })
})

app.get('/home', (req, res) => {
    res.redirect('/')
});