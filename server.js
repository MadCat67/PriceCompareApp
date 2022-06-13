//importing dependancy's
const express = require('express')
const app = express()
const puppeteer = require('puppeteer')
const cors = require('cors')
const path = require('path')

//allos GET and POST with react app
app.use(cors({origin: 'http://localhost:3000'}))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
const port = process.env.PORT || 4000
let FinalValues = {}
let Item = null

//serves build file from react /build folder
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client/build', 'index.html'))
    })
}

//simple routes
app.post('/post', (req, res) => {
    Item = req.body.Item 
})

app.get('/', async (req, res) => {
    await scrapeProduct('https://www.amazon.com/ref=nav_logo')
    res.json(FinalValues)
})

//web scraper
async function scrapeProduct(url){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)
    await page.type('#twotabsearchtextbox',Item)
    await page.click('#nav-search-submit-button')
    await page.waitForNavigation()
    const prices = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.a-price-whole')).map(x => x.textContent)
    })
    const wholePrices = prices.join('').split('.')
    const [one, two, three] = wholePrices.map(i => i.replace(',', ''))
    console.log(wholePrices)
    const sum = parseInt(one) + parseInt(two) + parseInt(three)
    FinalValues.average = Math.floor(sum / 3)
    Item = null
    FinalValues.image = await page.evaluate(() => {
        return document.querySelector('.s-image').getAttribute('src')
    })
    const IntArr = wholePrices.map(item => parseInt(item))
    IntArr.splice(IntArr.length - 1, 1)
    FinalValues.cheapestPrice = Math.min(...IntArr)
    
    await browser.close()
}


app.listen(port)