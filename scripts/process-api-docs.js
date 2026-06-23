// @ts-check

const glob = require('fast-glob');
const path = require('path');
const updateHtmlFile = require('./update-html-file');

const apiDocsDirname = path.join(
  __dirname,
  '../packages/website/build/feature-hub/api',
);

// Rename "Modules" to "Packages" on the index page.

updateHtmlFile(path.join(apiDocsDirname, 'index.html'), ($) => {
  $('.tsd-index-section h3').text('Packages');
});

// Remove "Defined in ..." elements for all sources in node_modules.

const filenames = glob.sync(path.join(apiDocsDirname, '**/*.html')).map(String);
/*
// -- START REWRITE LINKS
const toPosixPath = (filename) => filename.split(path.sep).join(path.posix.sep);

const rewriteTypeDocUrl = (filename, url) => {
  if (
    !url ||
    url.startsWith('#') ||
    url.startsWith('/') ||
    /^[a-z][a-z0-9+.-]*:/i.test(url) ||
    url.startsWith('//')
  ) {
    return url;
  }

  const match = /^([^?#]*)([?#].*)?$/.exec(url);
  const urlPath = match && match[1];
  const suffix = (match && match[2]) || '';

  if (
    !urlPath ||
    !(
      /^(?:\.\.\/)*assets\//.test(urlPath) ||
      /^(?:\.\.\/)*media\//.test(urlPath) ||
      urlPath.endsWith('.html')
    )
  ) {
    return url;
  }

  const dirname = toPosixPath(
    path.relative(apiDocsDirname, path.dirname(filename)),
  );
  const rewrittenPath = path.posix.normalize(path.posix.join(dirname, urlPath));

  return `/api/${rewrittenPath}${suffix}`;
};

for (const filename of filenames) {
  updateHtmlFile(filename, ($) => {
    $('[href], [src]').each((_index, element) => {
      for (const attribute of ['href', 'src']) {
        const value = $(element).attr(attribute);

        if (value) {
          $(element).attr(attribute, rewriteTypeDocUrl(filename, value));
        }
      }
    });
  });
}
//-- END REWRITE LINKS
*/
for (const filename of filenames) {
  updateHtmlFile(filename, ($) => {
    $('.tsd-sources')
      .filter((_index, element) => /node_modules/.test($(element).text()))
      .remove();
  });
}

// add noopener and noreferrer to link to typedoc

for (const filename of filenames) {
  updateHtmlFile(filename, ($) => {
    $('.tsd-generator a').attr('rel', 'noopener noreferrer');
  });
}
