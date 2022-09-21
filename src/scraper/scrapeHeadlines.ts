import puppeteer from 'puppeteer'
import fs from 'fs/promises'

type Article = {
	imageUrl: string
	headline: string
	description: string
	author: string
	date: string
	url: string
}

const scraper = async () => {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	await page.goto(
		'https://www.wsj.com/news/markets/stocks?mod=nav_top_subsection'
	)

	const articlesCollection: Article[] = []

	const articlesLength = await page.$$eval(
		'#latest-stories article',
		async (articles) => {
			return articles.length
		}
	)

	const images = await page.$$eval(
		'.WSJTheme--image--At42misj',
		async (images) => {
			return images.map((index) => (index as HTMLImageElement).src)
		}
	)

	const headlines = await page.$$eval(
		'span.WSJTheme--headlineText--He1ANr9C',
		async (headlines) => {
			return headlines.map((index) => (index as HTMLElement).innerText)
		}
	)

	const descriptions = await page.$$eval(
		'span.WSJTheme--summaryText--2LRaCWgJ',
		async (descriptions) => {
			return descriptions.map((index) => (index as HTMLElement).innerText)
		}
	)

	const authors = await page.$$eval(
		'p.WSJTheme--byline--1oIUvtQ3',
		async (authors) => {
			return authors.map((index) => (index as HTMLElement).innerText)
		}
	)

	const dates = await page.$$eval(
		'p.WSJTheme--timestamp--22sfkNDv',
		async (dates) => {
			return dates.map((index) => (index as HTMLElement).innerText)
		}
	)

	// returns an empty array if selector is any more specific
	const urls = await page.$$eval('h2 a', async (urls) => {
		return urls.map((index) => (index as HTMLLinkElement).href)
	})

	for (let i = 0; i < articlesLength; i++) {
		const articleObj = {
			imageUrl: images[i],
			headline: headlines[i],
			description: descriptions[i],
			author: authors[i],
			date: dates[i],
			url: urls[i],
		}

		articlesCollection.push(articleObj)
	}

	await fs.writeFile('articles.json', JSON.stringify(articlesCollection))

	await browser.close()
}

scraper()