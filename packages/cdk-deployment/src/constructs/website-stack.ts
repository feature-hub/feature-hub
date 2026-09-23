import type {Construct} from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export interface WebsiteStackProps extends cdk.StackProps {
  certificateArn: string;
  hostedZoneId: string;
}

export class WebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'Certificate',
      props.certificateArn,
    );

    const cfDistribution = this.createCloudFrontDistribution(certificate);

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      exportName: 'CloudFrontUrl',
      value: cfDistribution.distributionDomainName,
    });

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'HostedZone',
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: 'feature-hub.io',
      },
    );

    this.createRoute53Records(cfDistribution, hostedZone);
  }

  private createCloudFrontDistribution(
    certificate: acm.ICertificate,
  ): cloudfront.Distribution {
    const acnResponseHeadersPolicy = this.createAcnResponseHeadersPolicy();

    return new cloudfront.Distribution(this, 'CfDist', {
      defaultBehavior: {
        origin: new origins.HttpOrigin('feature-hub.github.io', {
          originPath: '/feature-hub',
          ipAddressType: cloudfront.OriginIpAddressType.DUALSTACK,
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // Any form of caching results in 404 regardless of requestHeadersPolicy
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        responseHeadersPolicy: acnResponseHeadersPolicy,
      },
      defaultRootObject: 'index.html',
      domainNames: ['feature-hub.io', 'www.feature-hub.io'],
      certificate,
    });
  }

  /**
   * Custom response headers policy due to stricter requirements of ACN ISD.
   *
   * The preset ResponseHeadersPolicy.SECURITY_HEADERS is not sufficient.
   */
  private createAcnResponseHeadersPolicy(): cloudfront.ResponseHeadersPolicy {
    return new cloudfront.ResponseHeadersPolicy(
      this,
      'AcnResponseHeadersPolicy',
      {
        responseHeadersPolicyName: 'AcnResponseHeadersPolicy',
        securityHeadersBehavior: {
          strictTransportSecurity: {
            accessControlMaxAge: cdk.Duration.seconds(31536000), // 1 year
            includeSubdomains: true, // this is missing in the default policy
            override: true,
          },
          contentSecurityPolicy:
            this.createResponseHeadersContentSecurityPolicy(),
          contentTypeOptions: {override: true},
          referrerPolicy: {
            referrerPolicy:
              cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
          frameOptions: {
            frameOption: cloudfront.HeadersFrameOption.SAMEORIGIN,
            override: true,
          },
          xssProtection: {protection: true, modeBlock: true, override: true},
        },
        customHeadersBehavior: {
          customHeaders: [
            {
              header: 'Cache-Control',
              value: 'max-age=600, public', // 600 is used by github pages, but required public/private is missing
              override: true,
            },
          ],
        },
      },
    );
  }

  private createResponseHeadersContentSecurityPolicy(): cloudfront.ResponseHeadersContentSecurityPolicy {
    const contentSecurityPolicy = [
      this.createCspEntry('default-src', 'self'),
      this.createCspEntry(
        'script-src-elem',
        'self',
        'sha256-bI2b8zL8P3uzmgy+aB+Lh2ZEf8GRlptjS0Gs3QKMRSM=',
        'sha256-yjJ797QQq/UCxCa++V+5HS+UIQopKNOYVrgkv/NZ0B8=',
        // api pages
        'sha256-10m9WSfFWWa1qM9Z5+4hPCEFJP7DRPogeAkaBk+dSEo=',
      ),
      this.createCspEntry(
        'style-src',
        'self',
        'unsafe-hashes',
        // api pages
        'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=',
        'sha256-9C8E9lTl9Ufzx1ixGISzNmistLBAhsnFRHORD+qYhgw=',
        'sha256-ANwXa+n9mfOCGDPXssFD7zGY2Cs5m/i+vbEdHQ72Rbo=',
        'sha256-OY6beE2xYjf/xQc1K2/CzTJL3bzKquql5dkXG5HnxPQ=',
      ),
      this.createCspEntry(
        'style-src-attr',
        'unsafe-hashes',
        // default website
        'sha256-ABQhd/Zh/+VisTFZNhQsYXuyA6IQqAWJfkHgknQG1jo=',
        'sha256-aUTJP2L1OsdTcaUNqFKnHSLx2nYD7ng6wCSID4HUP5w=',
        'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog=',
        'sha256-iamlC7IYM1qQboC8UNCKoXh7F4NsLoIZm24lvXzKM54=',
        'sha256-JH9PGTz9RMFJX+rlfoxCXWDyhGqucRbQrwVKT0SWzAI=',
        'sha256-LG+rzMsUvyfv5Gxnaf7y6/Q4NaCaegFB5aqBq2OYb6Q=',
        'sha256-p+aiqswXihF3tvngLMNP8d/S7iGc3+CRXDSV6HBjTME=',
        'sha256-R6+bxKX1OG1hXBjea33/YlIGKXed2uAQrlUJnx5O6tI=',
        'sha256-wHbQxigg9aQsPujn/l4xOgX5SxAppag0RmED0WYNp60=',
        'sha256-X4NQZKRjLUxIwTx3QUKH35Nay23gJGsXjtq4Idy+cKE=',
        // api pages
      ),
    ].join(' ');

    return {
      contentSecurityPolicy,
      override: true,
    };
  }

  private createCspEntry(name: string, ...items: string[]): string {
    const list = items.map((e) => `'${e}'`).join(' ');
    return `${name} ${list};`;
  }

  private createRoute53Records(
    cfDistribution: cloudfront.Distribution,
    hostedZone: route53.IHostedZone,
  ): void {
    const cfTarget = new route53targets.CloudFrontTarget(cfDistribution);
    const route53Target = route53.RecordTarget.fromAlias(cfTarget);

    new route53.ARecord(this, 'MainAliasIPv4', {
      zone: hostedZone,
      target: route53Target,
    });
    new route53.AaaaRecord(this, 'MainAliasIPv6', {
      zone: hostedZone,
      target: route53Target,
    });

    new route53.ARecord(this, 'WwwAliasIPv4', {
      zone: hostedZone,
      recordName: 'www',
      target: route53Target,
    });
    new route53.AaaaRecord(this, 'WwwAliasIPv6', {
      zone: hostedZone,
      recordName: 'www',
      target: route53Target,
    });
  }
}
