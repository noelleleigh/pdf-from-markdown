const fs = require('fs')
const path = require('path')

const request = require('request')
const tmp = require('tmp')
const puppeteer = require('puppeteer')
const marked = require('marked')
marked.setOptions({
  gfm: true,
  breaks: true
})

// Function definitions

/**
 * Get the contents of a file over HTTP
 * @param {string} url - An HTTP URL to a file
 * @param {function} callback - A function that accepts the file contents
 */
const getBodyFromURL = function (url, callback) {
  request.get(url, (err, res, body) => {
    // Handle errors
    if (err) {
      throw err
    }
    if (res.statusCode !== 200) {
      throw Error('Status:', res.statusCode, url)
    }
    callback(body)
  })
}

/**
 * Get the contents of a local file
 * @param {string} path - Path to a file
 * @param {function} callback - A function that accepts the file contents
 */
const getBodyFromPath = function (path, callback) {
  fs.readFile(path, (err, data) => {
    if (err) throw err
    const body = data.toString('utf8')
    callback(body)
  })
}

/**
 * Put an HTML string into an HTML5 boilerplate under `.markdown-body` and
 * return the result. Uses GitHub markdown styling from https://github.com/sindresorhus/github-markdown-css
 * @param {string} htmlString
 * @returns {string}
 */
const insertIntoBoilerplate = function (htmlString) {
  const cssPath = path.resolve(path.join(__dirname, './node_modules/github-markdown-css/github-markdown.css'))
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Document</title>
      <link rel="stylesheet" href="${cssPath}" />
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
 * Save a Markdown string to a temporary HTML file and
 * call the callback with the path.
 * The file will be styled using GitHub's Markdown style.
 * @param {string} body - Markdown text
 * @param {function} callback - A function that accepts the HTML file path
 */
const convertMarkdowntoHTMLFile = function (body, callback) {
  // Convert Markdown to HTML and wrap in boilerplate
  const htmlFromMarkdown = marked(body)
  const fullHtml = insertIntoBoilerplate(htmlFromMarkdown)

  // Make a temp file for the HTML
  tmp.file({postfix: '.html'}, (err, path) => {
    if (err) throw err

    // Populate the file
    fs.writeFile(path, fullHtml, (err) => {
      if (err) throw err
      callback(path)
    })
  })
}

/**
 * Generate a PDF file from an HTML file.
 * Uses Puppeteer: https://github.com/GoogleChrome/puppeteer
 * @param {string} htmlFilePath
 * @param {Object} pdfOptions Options for [`page.pdf()`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions)
 * @returns {Promise<string>}
 */
const htmlFileToPDF = async function (htmlFilePath, pdfOptions, preview) {
  const browser = await puppeteer.launch({headless: !preview})
  const page = await browser.newPage()
  await page.goto(`file://${htmlFilePath}`, {waitUntil: 'networkidle2'})
  if (preview) {
    return
  }
  await page.pdf(pdfOptions).catch(err => {
    if (err.syscall === 'open') {
      console.error(`Could not open "${pdfOptions.path}". Is it open in another program?`)
    } else {
      console.error(err)
    }
  })
  await browser.close()

  return pdfOptions.path
}

/**
 * Read a Markdown file and produce a PDF file from its contents.
 * The file will be styled using Github's style.
 * @param {object} argv - the arguments passed in from yargs
 */
const main = function (argv) {
  // Decide how we're gonna retrieve the file
  const fetchFunction = argv.inputPath.startsWith('http') ? getBodyFromURL : getBodyFromPath

  // Get the file contents
  fetchFunction(argv.inputPath, body => {
    // Make a temp HTML file from the file contents
    convertMarkdowntoHTMLFile(body, htmlPath => {
      // Render that HTML file to a PDF file
      htmlFileToPDF(htmlPath, {
        path: path.resolve(argv.outputPath),
        format: 'letter',
        scale: argv.scale,
        printBackground: true,
        margin: {top: '0.25in', right: '0.5in', bottom: '0.25in', left: '0.5in'}
      }, argv.preview)
    })
  })
}

// Command-line operation

if (require.main === module) {
  const argv = require('yargs')
    .usage('$0 <inputPath> <outputPath>', 'Convert a Markdown file to a PDF File with GitHub styling', (yargs) => {
      yargs.positional('inputPath', {
        describe: 'Path/URL of a Markdown file',
        type: 'string'
      })
      yargs.positional('outputPath', {
        describe: 'Path of the output PDF file',
        type: 'string'
      })
      yargs.option('scale', {
        describe: 'Scale of the webpage rendering. Scale amount must be between 0.1 and 2.',
        type: 'number',
        default: 0.8
      })
      yargs.option('preview', {
        describe: 'Get a look at the document instead of rendering it as a PDF',
        type: 'boolean'
      })
      yargs.example('$0 https://www.example.com/document.md ./document.pdf', 'Generate a PDF from an online file')
      yargs.example('$0 C:/Documents/resume.md ./resume.pdf', 'Generate a PDF from a local file')
    })
    .argv
  main(argv)
}

module.exports = {'pdfFromMarkdown': main}
