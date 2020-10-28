// Objective ---> To pull out the fixed height url of the GIF and display
// Use handlebars to handle the looping through the data array and pulling the url

//https://api.giphy.com/v1/gifs/search -> stored in url
// ?api_key=
// &q=
// &limit=25
// &offset=0
// &rating=g
// &lang=en

// Libraries
const express = require('express');
const handlebars = require('express-handlebars');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;

// Configure environment
const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000;
const API_KEY = process.env.API_KEY || "";

const ENDPOINT = 'https://api.giphy.com/v1/gifs/search'

// Instances
const app = express();

// Configure express
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/static'));

// Configure handlebars
app.engine('hbs', handlebars({
    defaultLayout: 'default.hbs'
}));
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views');

// Request handlers
// Homepage
app.get('/', (req, res) => {
    res.status(200);
    res.type('text/html');
    res.render('index');
})

app.get('/search', async (req, res) => {
    res.status(200);
    res.type('text/html');

    const search = req.query['term'];

    const url = withQuery(
        ENDPOINT, {
            q: search,
            api_key: API_KEY,
            limit: 50,
            offset: 0,
            rating: 'g',
            lang: 'en'
        }
    )

    let result = await fetch(url);

    try {
        let rawGif = await result.json();
        // console.log(rawGif);

        let urlArr = [];
        for (let i = 0; i < rawGif.data.length; i++) {
            urlArr.push(rawGif.data[i].images.fixed_height.url);
        }

        res.render('giffed', {urlArr});

    } catch (e) {
        console.error('error');
        return Promise.reject(e);
    }
})

// Start express server
if (API_KEY) {
    app.listen(PORT, () => {
        console.log(`Application started on port ${PORT} at ${new Date}`);
        console.log(`With key ${API_KEY}`);
    });
} else {
    console.error('API_KEY is not set');
}
