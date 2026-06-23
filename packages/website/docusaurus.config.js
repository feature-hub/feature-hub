// @ts-check

const config = {
  title: 'Feature Hub',
  tagline: 'Create scalable web applications using micro frontends',
  url: 'https://feature-hub.io',
  baseUrl: '/',
  favicon: 'img/png/favicon.png',
  organizationName: 'feature-hub',
  projectName: 'feature-hub',
  trailingSlash: false,
  onBrokenLinks: 'warn',

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../../docs',
          routeBasePath: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/feature-hub/feature-hub/edit/main/docs/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Feature Hub',
      logo: {
        alt: 'Feature Hub',
        src: 'img/svg/logo.svg',
      },
      items: [
        {
          type: 'html',
          position: 'right',
          value: '<a class="navbar__item navbar__link" href="/api/">API</a>',
        },
        {
          label: 'GitHub',
          href: 'https://github.com/feature-hub/feature-hub',
          position: 'right',
        },
      ],
    },
    footer: {
      copyright: `Copyright (c) 2018-${new Date().getFullYear()} Accenture Song Build Germany GmbH`,
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    algolia: {
      appId: 'BH4D9OD16A',
      apiKey: 'bead2cf16cd4c92a9223c21b579d0d27',
      contextualSearch: false,
      indexName: 'feature-hub',
    },
    prism: {
      additionalLanguages: ['javascript', 'jsx', 'typescript', 'tsx'],
    },
  },
};

module.exports = config;
