const puppeteer = require('puppeteer');
const database = require("./database")
const fs = require('fs/promises');
const res = require('express/lib/response');
const { title } = require('process');

const urlNetflixNews = "https://about.netflix.com/fr/newsroom"
const urlNetflixLeaves = "https://www.digitaltrends.com/movies/best-movies-leaving-netflix/"
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

/// function to get all news movies and series arrival on Netflix
async function newsArrivals() {
    const browser = await puppeteer.launch({headless: true}); // launch browser
    const page = await browser.newPage(); // create a new page to navigate
    const url = "https://about.netflix.com/fr/new-to-watch";
    page.setDefaultNavigationTimeout(0); 

    await page.goto(url);
    const AllMovies = await getAllMovies(page);
    for (let movie of AllMovies)
    {
        await database.addNewShow(movie)
    }
    
    await browser.close()
}

async function getNewMovies(page, moviesTab, isDown) {
    if (isDown === false) {
        await scrollToBottom(page)
        isDown = true
    } else {
        await scrollToTop(page)
        isDown = false
    }
    const movies = await page.$$("#release-schedule > div");
    for (let movie of movies) {
        const movieData = await movie.$("a");
        const movieDate = await movieData.$("div > p.release-schedule-grid-cardstyles__DateText-sc-15f8nyv-2.dJFmAg");
        const movieImg = await movie.$("div > span > img");
        moviesTab.push({
            title: await page.evaluate(el => el.getAttribute("aria-label"), movieData),
            link: await page.evaluate(el => el.getAttribute("href"), movieData),
            date: await page.evaluate(el => el.innerHTML, movieDate),
            img: await page.evaluate(el => el.getAttribute("src"), movieImg),
        })
    }
    return isDown
}

async function scrollToBottom(page) {
    await page.evaluate(async () => {
        let scrollPosition = 0
        let documentHeight = document.body.scrollHeight
        while (documentHeight > scrollPosition) {
            window.scrollBy(0, documentHeight)
            await new Promise(resolve => {
                setTimeout(resolve, 1000)
            })
            scrollPosition = documentHeight
            documentHeight = document.body.scrollHeight
        }
    })
}

async function scrollToBottom2(page,step,height,wait) {
    await page.evaluate(async (step,height,wait) => {
        let documentHeight = step
        while (documentHeight < height) {
            window.scrollBy(0, documentHeight)
            await new Promise(resolve => {
                setTimeout(resolve, wait)
            })
            documentHeight += step
        }
    },step,height,wait)
}

async function scrollToTop(page) {
    await page.evaluate(async () => {
        let scrollPosition = document.body.scrollHeight

        while (scrollPosition > 0) {
            window.scrollBy(0, -scrollPosition)
            await new Promise(resolve => {
                setTimeout(resolve, 1000)
            })
            scrollPosition -= scrollPosition
        }
    })
}

async function getAllMovies(page) {
    let button = await page.$("#main-content > div.paginationstyles__PaginationWrapper-sc-1ma3op1-0.eapWyF > nav > div.paginationstyles__PaginationPageNumberArrow-sc-1ma3op1-2.fOkA-dn > button")
    let moviesTab = []
    let isDown = false
    do {
        isDown = await getNewMovies(page, moviesTab, isDown);
        await page.evaluate(el => el.click(), button);
        button = await page.$("#main-content > div.paginationstyles__PaginationWrapper-sc-1ma3op1-0.eapWyF > nav > div.paginationstyles__PaginationPageNumberArrow-sc-1ma3op1-2.fOkA-dn > button")
    } while (button != null)
    return moviesTab
}

async function getCountryTopTen() {
    getTopTen("france");
    getTopTen("united-states");
    getTopTen("india");
    getTopTen("brazil")
    getTopTen("south-africa")
}

/// Functions to get the TOP TEN NETFLIX FRANCE
async function getTopTen(country) {
    const browser = await puppeteer.launch({headless: true}); // launch browser
    const page = await browser.newPage(); // create a new page to navigate

    await page.goto("https://top10.netflix.com/"+ country +"/films");
    let topTenObj = {
        country: country,
        date : await page.evaluate(el => el.innerHTML,await page.$("#maincontent > div > div > div")),
        topTenMovie : [],
        topTenSerie : []
    }
    topTenObj.topTenMovie = await getAllTopTen(page);
    
    await page.goto("https://top10.netflix.com/"+ country +"/tv");
    topTenObj.topTenSerie = await getAllTopTen(page);

    database.addTopTen(topTenObj)
    
    await browser.close();
}

async function getAllTopTen(page) {
    let topTenTab = [];
    for (let i = 1; i <= 10; i++) {
        let button = await page.$(`#weekly-lists > div > div.full-column.max-w-full.mx-auto.py-1.md\\:py-3.px-1 > div.mb-12.list-banner-container.md\\:mb-0.md\\:overflow-hidden > div > ul > button:nth-child(${i})`)
        await page.evaluate(el => el.click(), button);
        await topTenData(page, topTenTab);
    }
    return topTenTab
}

async function topTenData(page, topTenTab) {
    const classement = await page.$("#weekly-lists > div > div.full-column.max-w-full.mx-auto.py-1.md\\:py-3.px-1 > div.mb-12.list-banner-container.md\\:mb-0.md\\:overflow-hidden > div > ul > button.banner-title.relative.flex-1.box-content.h-full.cursor-default.banner-expanded-padding.expanded > div.list-banner-corner-number.opacity-90.md\\:opacity-0")
    const img = await page.$("#weekly-lists > div > div.full-column.max-w-full.mx-auto.py-1.md\\:py-3.px-1 > div.mb-12.list-banner-container.md\\:mb-0.md\\:overflow-hidden > div > ul > button.banner-title.relative.flex-1.box-content.h-full.cursor-default.banner-expanded-padding.expanded > div.relative.wh-full > div.absolute.top-0.left-0.h-full.overflow-hidden.group > picture > img");
    let title = await page.$("#weekly-lists > div > div.full-column.max-w-full.mx-auto.py-1.md\\:py-3.px-1 > div.mb-12.list-banner-container.md\\:mb-0.md\\:overflow-hidden > div > ul > button.banner-title.relative.flex-1.box-content.h-full.cursor-default.banner-expanded-padding.expanded > div.relative.wh-full > div.absolute.top-0.left-0.h-full.overflow-hidden.group > div > div");
    const link = await page.$("#weekly-lists > div > div.full-column.max-w-full.mx-auto.py-1.md\\:py-3.px-1 > div.mb-12.list-banner-container.md\\:mb-0.md\\:overflow-hidden > div > ul > button.banner-title.relative.flex-1.box-content.h-full.cursor-default.banner-expanded-padding.expanded > div.relative.wh-full > div.banner-expanded-negative-margin.relative.h-full > div.absolute.bottom-0.z-40.w-full.h-full.md\\:h-auto.md\\:px-3.xl\\:px-6.md\\:bottom-3.lg\\:bottom-6 > div > a");
    title = await page.evaluate(el => el.innerHTML, title)
    title = title.replace("&amp;","&")
    topTenTab.push({
        classement: await page.evaluate(el => el.innerHTML, classement),
        title: title,
        img: await page.evaluate(el => el.getAttribute("src"), img),
        link: await page.evaluate(el => el.getAttribute("href"), link)
    });
}


/// Functions to get news about Netflix
async function getNetflixNews() {
    const browser = await puppeteer.launch({headless: true}); // launch browser
    const page = await browser.newPage(); // create a new page to navigate
    await page.setViewport({width: 1080, height:661})
    page.setDefaultNavigationTimeout(0); 

    await page.goto(urlNetflixNews);
    let AllNews = await getAllNews(page);
    for (let news of AllNews) {
        database.addNews(news)
    }

    await browser.close();
}

async function getAllNews(page) {
    let newsArray = []
    await scrollToBottom(page)
    const news = await page.$$("#main-content > div.commonstyles__NewsroomArticlesGrid-s12ap6-0.BmDOA > div.commonstyles__NewsroomArticlesWrapper-s12ap6-2.gwHkPj > div.articlesstyles__ArticlesGridWrapper-sc-1i5enrz-0.llUdWz > div.articlesstyles__ArticlesGrid-sc-1i5enrz-4.bSdoBj > div")
    for (let element of news) {
        const newsDate = await element.$("div.articlesstyles__ArticleContentWrapper-sc-1i5enrz-3.kPVMaa >span");
        const newsLink = await element.$("div.articlesstyles__ArticleContentWrapper-sc-1i5enrz-3.kPVMaa > p > a");
        const image = await element.$("div.articlesstyles__ArticleImageWrapper-sc-1i5enrz-5 > a > div > span > img");
        let content = await page.evaluate(el => el.innerText, newsLink)
        content = content.replace("→","")
        newsArray.push({
            date: await page.evaluate(el => el.innerHTML, newsDate),
            link: "https://about.netflix.com" + await page.evaluate(el => el.getAttribute("href"), newsLink),
            content: content,
            img : await page.evaluate(el => el.getAttribute("src"), image),
        })
    }
    return newsArray
}

const getAllNetflixLeaves = async () => {
    const date = new Date();
    const currentMonth = date.getMonth();
    getNetflixLeaves(Object.keys(month)[currentMonth],date.getFullYear());
    getNetflixLeaves(Object.keys(month)[currentMonth + 1],date.getFullYear());
    getNetflixLeaves(Object.keys(month)[currentMonth + 2],date.getFullYear());
}

const getNetflixLeaves = async (month,year) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto("https://www.whats-on-netflix.com/leaving-soon/whats-leaving-netflix-in-"+ month +"-"+ year +"/");

    result = await getAllLeaves(page)
    if (Object.keys(result).length != 0) {
        database.addLeavingShows(result);
    }

    await browser.close()
}

const getAllLeaves = async (page) => {
    await scrollToBottom2(page,150,2000,75)
    const date = await page.$("#page > div > div > div > div.content > div > article > div.entry > div > h3")
    if (date == null) {
        return {}
    }
    const mainImage = await page.$("#page > div > div > div > div.content > div > article > div.entry > div > p:nth-child(1) > img")
    let Images = await page.$$("#page > div > div > div > div.content > div > article > div.entry > div > p > img")
    let all = await page.$$("#page > div > div > div > div.content > div > article > div.entry > div > ul")
    let result = {date: await page.evaluate(el => el.innerText, date), mainImage: await page.evaluate(el => el.getAttribute("src"),mainImage),imgs: [],titles: []}
    for (let element of all){
        let title = await page.evaluate(el => el.innerText,element);

        for (let e of title.split("\n")) {
            result.titles.push({
                title: e,
            })
        }
    }
    for (let [index,element] of Images.entries()) {
        if (index == 0) {
            continue
        } 
        result.imgs.push({
            src: await page.evaluate(el => el.getAttribute("src"),element)
        })
    }
    return result
}

function Crawler() {
    newsArrivals().then(() => console.log("[Database] Netflix new arrivals fetched"))
    getCountryTopTen().then(() => console.log("[Database] Netflix top ten fetched"))
    getNetflixNews().then(() => console.log("[Database] Netflix News fetched"))
    getAllNetflixLeaves().then(() => console.log("[Database] Netflix leaves fetched"))
}

module.exports.Crawl = Crawler