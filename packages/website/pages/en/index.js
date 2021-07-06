// @ts-check

const React = require('react');

/**
 * @param {string} doc
 * @param {import('./index').SiteConfig} config
 * @param {string} language
 */
function createDocUrl(doc, {baseUrl, docsUrl}, language = '') {
  const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
  const langPart = `${language ? `${language}/` : ''}`;

  return `${baseUrl}${docsPart}${langPart}${doc}`;
}

/**
 * @param {import('./index').SplashContainerProps} props
 */
const SplashContainer = ({children}) => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="projectLogo">
        <img src="/img/svg/logo.svg" alt="Feature Hub" role="presentation" />
      </div>
      <div className="wrapper homeWrapper">{children}</div>
    </div>
  </div>
);

/**
 * @param {import('./index').ProjectTitleProps} props
 */
const ProjectTitle = ({config}) => (
  <h2 className="projectTitle">
    {config.title}
    <small>{config.tagline}</small>
  </h2>
);

/**
 * @param {import('./index').PromoSectionProps} props
 */
const PromoSection = ({children}) => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{children}</div>
    </div>
  </div>
);

/**
 * @param {import('./index').ButtonProps} props
 */
const Button = ({children, href, target}) => (
  <div className="pluginWrapper buttonWrapper">
    <a className="button" href={href} target={target}>
      {children}
    </a>
  </div>
);

/**
 * @param {import('./index').HomeSplashProps} props
 */
const HomeSplash = ({config}) => (
  <SplashContainer>
    <div className="inner">
      <ProjectTitle config={config} />
      <PromoSection>
        <Button href={createDocUrl('getting-started/introduction', config)}>
          Get Started
        </Button>
        <Button href="https://github.com/sinnerschrader/feature-hub">
          GitHub
        </Button>
      </PromoSection>
    </div>
  </SplashContainer>
);

/**
 * @param {import('./index').IndexProps} props
 */
const Index = ({config, language = ''}) => (
  <HomeSplash config={config} language={language} />
);

module.exports = Index;
