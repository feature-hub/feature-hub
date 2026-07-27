import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import type {Construct} from 'constructs';

export interface CertificateStackProps extends cdk.StackProps {
  hostedZoneId: string;
}

export class CertificateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const myHostedZone = route53.HostedZone.fromHostedZoneId(
      this,
      'MyHostedZone',
      props.hostedZoneId,
    );

    const myCertificate = new acm.Certificate(this, 'MyCertificate', {
      domainName: 'feature-hub.io',
      subjectAlternativeNames: ['www.feature-hub.io'],
      validation: acm.CertificateValidation.fromDns(myHostedZone),
    });

    new cdk.CfnOutput(this, 'CertificateArn', {
      exportName: 'CertificateArn',
      value: myCertificate.certificateArn,
    });
  }
}
