var express = require('express');
var database = require('../modules/database')
var router = express.Router();
var dataBase = require('../modules/database')
var monthARR = ["January","February","March","April", "May", "June", "July", "August","September","October","November", "December"];


let countryTab = ["france","india","united-states","brazil","south-africa"]

function getcookie(req) {
    var cookie = req.headers.cookie;
    if (cookie != undefined) {
        let AllCookies = cookie.split('; ');
        let Cookies = {};
        AllCookies.map(el => {
            elSplit = el.split("=");
            Cookies[elSplit[0]] = elSplit[1]
        })
        return Cookies
    } else {
        return {}
    }
}

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/aboutus', (req, res) => {
    res.render('aboutus');
});

router.get('/top10', (req, res) => {
    let allCookies = getcookie(req)
    if (allCookies.currentmovieCarousel == undefined) {
        allCookies.currentmovieCarousel = "2"
    }
    if (allCookies.currentserieCarousel == undefined) {
        allCookies.currentserieCarousel = "2"
    }
    let country = req.query.country;
    if (country != null) {
        countryTab.splice(countryTab.indexOf(country), 1);
        countryTab.splice(0, 0, country);
        database.getTopTens(country).then((data) => {
            res.render('top10', {
                top10: {date: data.date,
                topTenMovie: data.topTenMovie,
                topTenSerie: data.topTenSerie},
                country: countryTab,
                currentmovieCarousel: allCookies.currentmovieCarousel,
                currentserieCarousel: allCookies.currentserieCarousel
            });
        });
    } else {
        database.getTopTens("france").then((data) => {
            res.render('top10', {
                top10: {date: data.date,
                topTenMovie: data.topTenMovie,
                topTenSerie: data.topTenSerie},
                country: ["france","india","united-states","brazil","south-africa"],
                currentmovieCarousel: allCookies.currentmovieCarousel,
                currentserieCarousel: allCookies.currentserieCarousel
            });
        });
    }
});

router.get('/LastChance', (req,res) => {
    dataBase.getLeavingShows().then((leavingShows) => {
        res.render('lastchance', {
            leavingShows: leavingShows
        })
    })
})


router.get('/News', (req, res) => {
    dataBase.getNetflixNews().then((netflixNews) =>
        res.render('news', {
                newsNetflix : netflixNews
            })
    );
});

router.get('/UpComing', (req, res) => {
    dataBase.getNewArrivals().then((newShow) =>
        res.render('upComing', {
            upComing : newShow,
            month : monthARR[new Date().getMonth()],
            year : new Date().getFullYear(),
        })
    );
});

module.exports = router;