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
        'sha256-yjJ797QQq/UCxCa++V+5HS+UIQopKNOYVrgkv/NZ0B8=',
        'sha256-bI2b8zL8P3uzmgy+aB+Lh2ZEf8GRlptjS0Gs3QKMRSM=',
      ),
      this.createCspEntry(
        'style-src-attr',
        'unsafe-hashes',
        'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog=',
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
