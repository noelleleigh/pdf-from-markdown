require('dotenv').config()
const process = require('process')
const fs = require('fs')

const request = require('request')
const md = require('markdown-it')()
const tmp = require('tmp')
const puppeteer = require('puppeteer')

// Function definitions

/**
 * Generate a PDF from an HTML file.
 * Uses Puppeteer: https://github.com/GoogleChrome/puppeteer
 * @param {string} htmlFilePath
 * @param {Object} pdfOptions Options for [`page.pdf()`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions)
 * @returns {Promise<string>}
 */
const htmlFileToPDF = async function htmlFileToPDF (htmlFilePath, pdfOptions) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(`file://${htmlFilePath}`, {waitUntil: 'networkidle2'})
  await page.pdf(pdfOptions)
  await browser.close()

  return pdfOptions.path
}

/**
 * Put an HTML string into an HTML5 boilerplate under `.markdown-body` and
 * return the result. Uses GitHub markdown styling from https://github.com/sindresorhus/github-markdown-css
 * @param {string} htmlString
 */
const insertIntoBoilerplate = function insertIntoBoilerplate (htmlString) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Document</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.10.0/github-markdown.css" integrity="sha256-qTBXiGmok0OwSTNA1uvNgoO6GSylS8Ty3TBjogwOxVo=" crossorigin="anonymous" />
  </head>
  <body>
      <main class="markdown-body">
          ${htmlString}
      </main>
  </body>
  </html>
  `
}

/**
 * Save a Markdown document from a URL as a PDF.
 * @param {string} url
 * @param {string} outputPath
 */
const makePdfFromMarkdown = function makePdfFromMarkdown (url, outputPath) {
  request.get(url, (err, res, body) => {
    // Handle errors
    if (err) {
      console.error(err)
      return
    }
    if (res.statusCode !== 200) {
      console.error('Status:', res.statusCode, url)
      return
    }
    // Convert Markdown to HTML and wrap in boilerplate
    const htmlFromMarkdown = md.render(body)
    const fullHtml = insertIntoBoilerplate(htmlFromMarkdown)

    // Make a temp file for the HTML
    tmp.file({postfix: '.html'}, (err, path) => {
      if (err) {
        console.error(err)
        return
      }

      // Populate the file
      fs.writeFile(path, fullHtml, (err) => {
        if (err) {
          console.error(err)
          return
        }

        // Generate a PDF from the contents of that HTML file
        htmlFileToPDF(path, {
          path: outputPath,
          format: 'letter',
          scale: 0.8,
          margin: {top: '0.25in', right: '0.5in', bottom: '0.25in', left: '0.5in'}
        })
      })
    })
  })
}

// Main execution

// Make sure we know where to get the Markdown file
if (process.env.MARKDOWN_URL === undefined) {
  console.error('Error: .env did not have a MARKDOWN_URL variable. See: https://www.npmjs.com/package/dotenv#usage')
  process.exit(1)
}

// Make sure we know where to put the PDF
if (process.argv[2] === undefined) {
  console.error('Error: Specify file path for output PDF: `node index.js {outputPath}`')
  process.exit(1)
}

makePdfFromMarkdown(process.env.MARKDOWN_URL, process.argv[2])
