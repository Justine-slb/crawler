const database = require('mongoose');
const uri = "mongodb+srv://CrawlerAdmin:Javascript@crawlercluster.mtkie.mongodb.net/NetflixData?retryWrites=true&w=majority";
const monthfr = {
    "janvier": 1,
    "février": 2,
    "mars": 3,
    "avril": 4,
    "mai": 5,
    "juin": 6,
    "juillet": 7,
    "août": 8,
    "septembre": 9,
    "octobre": 10,
    "novembre": 11,
    "décembre": 12
}

const month = {
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "may": 5,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12
}

const newShowSchema = new database.Schema({
    title: String,
    link: String,
    date: String,
    img: String
});
const NewShow = database.model('newShows', newShowSchema);

const newsSchema = new database.Schema({
    date: String,
    link: String,
    content: String,
    img: String
});
const NetflixNews = database.model('netflixNews', newsSchema)

const leavesSchema = new database.Schema({
    date: String,
    mainImage: String,
    imgs: Array,
    titles: Array
})
const LeavingShow = database.model("leavingShows", leavesSchema)

const topTenSchema = new database.Schema({
    country: String,
    date: String,
    topTenMovie: Array,
    topTenSerie: Array,
})
const TopTens = database.model("topTens", topTenSchema)


const parseDate = (date) => {
    let dateSplit = date.split(/[ /]/)
    let newDate
    if (dateSplit.length >= 5) {
        newDate = dateSplit[dateSplit.length - 2] + " " + dateSplit[dateSplit.length - 1]
    } else {
        if (isNaN(dateSplit[1])) {
            let currentMonth = monthfr[dateSplit[1]]
            newDate = dateSplit[0] + " " + Object.keys(month)[currentMonth - 1] + " " + dateSplit[2]
        } else {
            newDate = dateSplit[0] + " " + Object.keys(month)[dateSplit[1] - 1] + " " + dateSplit[2]
        }
    }
    return newDate
}

const addNewShow = async (showObj) => {
    await database.connect(uri);
    const exist = await NewShow.findOne({
        title: showObj.title
    });
    if (exist != null) {
        date = parseDate(showObj.date);
        if (date != exist.date) {
            exist.date = date
            await exist.save()
        }
        return
    }
    showObj.date = parseDate(showObj.date)
    const newShow = new NewShow(showObj);
    await newShow.save();
}

const addNews = async (newsObj) => {
    await database.connect(uri);
    if (newsObj.date != "Invalid date") {
        newsObj.date = parseDate(newsObj.date)
        const exist = await NetflixNews.findOne({
            content: newsObj.content,
            date: newsObj.date
        });
        if (exist != null) {
            return;
        }
        const news = new NetflixNews(newsObj);
        await news.save();
    } else {
        const exist = await NetflixNews.findOne({
            content: newsObj.content,
        });
        if (exist != null) {
            return;
        }
        const news = new NetflixNews({
            content: newsObj.content,
            link: newsObj.link,
            img: newsObj.img
        });
        await news.save();
    }
}

const addLeavingShow = async (LeavingObj) => {
    await database.connect(uri);
    LeavingObj.date = parseDate(LeavingObj.date)
    const exist = await LeavingShow.findOne({
        date: LeavingObj.date
    });
    if (exist != null) {
        return;
    }
    length = await LeavingShow.countDocuments({})
    if (length >= 3) {
        await LeavingShow.deleteOne({}).sort({
            date: -1
        })
    }
    const leaving = new LeavingShow(LeavingObj);
    await leaving.save();
}

const addTopTen = async (TopTenObj) => {
    await database.connect(uri);
    const exist = await TopTens.findOne({
        date: TopTenObj.date,
        country: TopTenObj.country
    });
    if (exist != null) {
        return
    }
    await TopTens.deleteMany({
        country: TopTenObj.country
    })
    const newTopTen = new TopTens(TopTenObj);
    await newTopTen.save();
}

const getTopTens = async (country) => {
    await database.connect(uri);
    return await TopTens.findOne({
        country: country
    }).sort({
        _id: -1
    }).limit(1).exec();
}

async function getNetflixNews() {
    try {
        netflixNews = await NetflixNews.find()
        return netflixNews
    } catch (err) {
        console.log(err)
    }
}

const getLeavingShows = async () => {
    await database.connect(uri);
    return await LeavingShow.find().sort({createdAt: 1})
}

async function getNewArrivals () {
    try {
        upComing = await NewShow.find()
        return upComing
    } catch (err) {
        console.log(err)
    }
}


module.exports.NewShows = NewShow
module.exports.NetflixNews = NetflixNews
module.exports.LeavingShows = LeavingShow
module.exports.TopTens = TopTens
module.exports.addNewShow = addNewShow
module.exports.addNews = addNews
module.exports.addLeavingShows = addLeavingShow
module.exports.addTopTen = addTopTen
module.exports.getTopTens = getTopTens
module.exports.getNetflixNews = getNetflixNews
module.exports.getLeavingShows = getLeavingShows
module.exports.getNewArrivals = getNewArrivals









