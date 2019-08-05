# pdf-from-markdown
Generate a GitHub-styled PDF from a local or online Markdown document.

I wrote this because I was tired of wrestling with pandocs trying to get my Gist-hosted resume into a nice, GitHub-styled PDF. Plus it was a fun exercise!

## Install & Usage
1. Clone from GitHub:
```
git clone https://github.com/noelleleigh/pdf-from-markdown.git
```
2. Enter cloned directory:
```
cd ./pdf-from-markdown
```
3. Install dependencies:
```
npm install
```
4. Run with Node.js. Usage:
```
> node .\index.js --help
index.js <inputPath> <outputPath>

Convert a Markdown file to a PDF File with GitHub styling

Positionals:
  inputPath   Path/URL of a Markdown file                               [string]
  outputPath  Path of the output PDF file                               [string]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]

Examples:
  Generate a PDF from an online file:

  node index.js https://www.example.com/document.md ./document.pdf

  Generate a PDF from a local file:

  node index.js C:/Documents/resume.md ./resume.pdf
```

## Credits
- [marked](https://github.com/markedjs/marked): Markdown parsing
- [github-markdown-css](https://github.com/sindresorhus/github-markdown-css): GitHub CSS styling
- [puppeteer](https://github.com/GoogleChrome/puppeteer): PDF rendering
