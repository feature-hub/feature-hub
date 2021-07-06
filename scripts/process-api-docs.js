// @ts-check

const glob = require('fast-glob');
const path = require('path');
const updateHtmlFile = require('./update-html-file');

const apiDocsDirname = path.join(
  __dirname,
  '../packages/website/build/feature-hub/api'
);

// Rename "Modules" to "Packages" on the index page.

updateHtmlFile(path.join(apiDocsDirname, 'index.html'), ($) => {
  $('.tsd-index-section h3').text('Packages');
});

// Remove "Defined in ..." elements for all sources in node_modules.

const filenames = glob.sync(path.join(apiDocsDirname, '**/*.html')).map(String);

for (const filename of filenames) {
  updateHtmlFile(filename, ($) => {
    $('.tsd-sources')
      .filter((_index, element) => /node_modules/.test($(element).text()))
      .remove();
  });
}
