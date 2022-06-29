//importing dependancy's
const express = require('express')
const app = express()
const puppeteer = require('puppeteer')
const cors = require('cors')
const path = require('path')
const bodyParser = require("body-parser")
const { Agent } = require('http')

//allos GET and POST with react app
app.use(cors())
app.use(bodyParser.json())
app.use(express.urlencoded({extended: false}))
const port = process.env.PORT || 5000
let FinalValues = {}
let Item = null

//simple routes
app.post('/post', (req, res) => {
    Item = req.body.Item 
})

app.get('/scrape', async (req, res) => {
    await scrapeProduct('https://www.amazon.com/ref=nav_logo')
    res.json(FinalValues)
})

//web scraper
async function scrapeProduct(url){
    //stuff needed for deployment
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    })
    //go to amazon and search the requested product
    const page = await browser.newPage()
    await page.goto(url)
    await page.type('#twotabsearchtextbox',Item)
    await page.click('#nav-search-submit-button')
    await page.waitForNavigation()
    const OgUrl = page.url()
    //get all the prices
    const prices = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.a-price-whole')).map(x => x.textContent)
    })
    const wholePrices = prices.join('').split('.')
    const [one, two, three] = wholePrices.map(i => i.replace(',', ''))
    console.log(wholePrices)
    const sum = parseInt(one) + parseInt(two) + parseInt(three)
    FinalValues.average = Math.floor(sum / 3)
    Item = null
    //get src of the first image that we cann find
    FinalValues.image = await page.evaluate(() => {
        return document.querySelector('.s-image').getAttribute('src')
    })
    //return the lowest and highest price
    const IntArr = wholePrices.map(item => parseInt(item))
    IntArr.splice(IntArr.length - 1, 1)
    FinalValues.cheapestPrice = Math.min(...IntArr)
    FinalValues.largestPrice = Math.max(...IntArr)
    //get a link to the item with the lowest and highest price
    await page.type('#low-price', FinalValues.cheapestPrice.toString())
    await page.type('#high-price', (FinalValues.cheapestPrice + 1).toString())
    await page.click('.a-button-input')
    await page.waitForNavigation()
    await page.click('.s-image')
    await page.waitForNavigation()
    FinalValues.LowLink = page.url()

    await page.goto(OgUrl)
    await page.type('#low-price', FinalValues.largestPrice.toString())
    await page.type('#high-price', (FinalValues.largestPrice + 1).toString())
    await page.click('.a-button-input')
    await page.waitForNavigation()
    await page.click('.s-image')
    await page.waitForNavigation()
    FinalValues.HighLink = page.url()

    console.log(FinalValues.LowLink)
    await browser.close()
}

//serves build file from react /build folder
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client/build', 'index.html'))
    })
}


app.listen(port)