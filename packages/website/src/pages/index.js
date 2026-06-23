// @ts-check

import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}
      noFooter
      wrapperClassName="homePage"
    >
      <main className="homeHero">
        <img
          className="homeLogo"
          src="/img/svg/logo.svg"
          alt="Feature Hub"
          role="presentation"
        />
        <h1 className="homeTitle">{siteConfig.title}</h1>
        <p className="homeTagline">{siteConfig.tagline}</p>
        <div className="homeActions">
          <Link className="homeButton" to="/docs/getting-started/introduction">
            Get Started
          </Link>
          <Link
            className="homeButton"
            to="https://github.com/feature-hub/feature-hub"
          >
            GitHub
          </Link>
        </div>
      </main>
    </Layout>
  );
}

export default Home;
