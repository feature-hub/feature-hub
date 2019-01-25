// @ts-check

const siteConfig = {
  title: 'Feature Hub',
  tagline: 'Create scalable web applications using micro frontends',
  url: 'https://feature-hub.io',
  baseUrl: '/',
  projectName: 'feature-hub',
  organizationName: 'sinnerschrader',
  headerLinks: [
    {search: true},
    {label: 'GitHub', href: 'https://github.com/sinnerschrader/feature-hub'}
  ],
  colors: {primaryColor: '#500dc5', secondaryColor: '#ea3458'},
  copyright: `Copyright (c) 2018-${new Date().getFullYear()} SinnerSchrader Deutschland GmbH`,
  highlight: {theme: 'default'},
  onPageNav: 'separate',
  cleanUrl: true,
  customDocsPath: '../docs',
  headerIcon: 'img/logo.svg',
  favicon: 'img/favicon.png',
  editUrl: 'https://github.com/sinnerschrader/feature-hub/edit/master/docs/',
  enableUpdateBy: true,
  enableUpdateTime: true,
  scrollToTop: true,
  algolia: {
    apiKey: 'bead2cf16cd4c92a9223c21b579d0d27',
    indexName: 'feature-hub'
  }
};

module.exports = siteConfig;
