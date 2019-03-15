// @ts-check

const cheerio = require('cheerio');
const fs = require('fs');

/**
 * Load the HTML file for the given file name from disk, update its contents
 * with cheerio, and finally write the file back to disk.
 *
 * @param {string} filename
 * @param {{ ($: CheerioStatic): void; }} update
 */
module.exports = function updateHtmlFile(filename, update) {
  const html = fs.readFileSync(filename, {encoding: 'utf8'});
  const $ = cheerio.load(html);

  update($);

  fs.writeFileSync(filename, $.html(), {encoding: 'utf8'});
};
