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
    {label: 'API', href: '/api/'},
    {label: 'GitHub', href: 'https://github.com/sinnerschrader/feature-hub'},
  ],
  colors: {primaryColor: '#500dc5', secondaryColor: '#ea3458'},
  copyright: `Copyright (c) 2018-${new Date().getFullYear()} SinnerSchrader Deutschland GmbH`,
  usePrism: ['js', 'jsx'],
  highlight: {theme: 'default'},
  onPageNav: 'separate',
  cleanUrl: true,
  customDocsPath: '../docs',
  headerIcon: 'img/svg/logo.svg',
  favicon: 'img/png/favicon.png',
  editUrl: 'https://github.com/sinnerschrader/feature-hub/edit/master/docs/',
  enableUpdateBy: true,
  enableUpdateTime: true,
  scrollToTop: true,
  algolia: {
    apiKey: 'bead2cf16cd4c92a9223c21b579d0d27',
    indexName: 'feature-hub',
  },
  markdownPlugins: [
    (md) => {
      md.inline.ruler.enable(['sub', 'sup']);
    },
  ],
};

module.exports = siteConfig;
