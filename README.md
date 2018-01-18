# pdf-from-markdown
Generate a GitHub-styled PDF from a Markdown document at a URL using Node.js. Intended for use with documents whose canonical versions live as Markdown files on the web. I got fed up with wrestling with `pandoc` and other tools and decided to make my own that works for my needs using [Node.js](https://nodejs.org/).

Markdown parsing is done with [markdown-it](https://github.com/markdown-it/markdown-it) and PDF generation is done by [puppeteer](https://github.com/GoogleChrome/puppeteer).

## Install & Usage
1. Clone from GitHub:
```
git clone https://github.com/noahleigh/pdf-from-markdown.git
```
2. Enter cloned directory:
```
cd ./pdf-from-markdown
```
3. Install dependencies:
```
npm install
```
4. Create a file named `.env` in the directory and add avariable named `MARKDOWN_URL` in it. Example `.env` contents:
```
MARKDOWN_URL=https://www.example.com/markdown_file.md
```
5. Run Node.js with the desired output file as the second argument:
```
node ./index.js ./markdown-pdf.pdf
```
