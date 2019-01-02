// @ts-check

const siteConfig = {
  title: 'Feature Hub',
  tagline: 'Create scalable web applications using micro frontends',
  url: 'https://feature-hub.netlify.com',
  baseUrl: '/',
  projectName: 'feature-hub',
  organizationName: 'sinnerschrader',
  headerLinks: [
    {label: 'GitHub', href: 'https://github.com/sinnerschrader/feature-hub'}
  ],
  colors: {primaryColor: '#4502da', secondaryColor: '#16181e'},
  copyright: `Copyright (c) 2018-${new Date().getFullYear()} SinnerSchrader Deutschland GmbH`,
  highlight: {theme: 'default'},
  onPageNav: 'separate',
  cleanUrl: true,
  customDocsPath: '../docs',
  scripts: [{src: '/external-sidebar-links.js', async: true}]
};

module.exports = siteConfig;
