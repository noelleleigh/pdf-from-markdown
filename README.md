# pdf-from-markdown
Generate a GitHub-styled PDF from a local or online Markdown document.

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
4. Run Node.js:
```
> node .\index.js --help
index.js <inputPath> <outputPath>

Convert a Markdown file to a PDF with GitHub styling

Positionals:
  inputPath   Path/URL of a Markdown file                               [string]
  outputPath  Path of the output PDF file                               [string]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

## Credits
- [marked](https://github.com/markedjs/marked): Markdown parsing
- [github-markdown-css](https://github.com/sindresorhus/github-markdown-css): GitHub CSS styling
- [puppeteer](https://github.com/GoogleChrome/puppeteer): PDF rendering
