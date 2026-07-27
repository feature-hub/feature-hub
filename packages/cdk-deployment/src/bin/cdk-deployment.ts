#!/usr/bin/env node

import * as cdk from 'aws-cdk-lib/core';
import {CertificateStack} from '../constructs/certificate-stack';
import {WebsiteStack} from '../constructs/website-stack';

/* Env setup, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
const ACCOUNT_ID = '556281861887'; // Mofa

const HOSTED_ZONE_ID = 'Z08745121XMHUJU8EL9CI'; // feature-hub.io

const app = new cdk.App();

new CertificateStack(app, 'CertificateStack', {
  env: {account: ACCOUNT_ID, region: 'us-east-1'},

  hostedZoneId: HOSTED_ZONE_ID,
});

new WebsiteStack(app, 'WebsiteStack', {
  env: {account: ACCOUNT_ID, region: 'eu-central-1'},

  certificateArn:
    'arn:aws:acm:us-east-1:556281861887:certificate/cfc908ac-291d-4091-8ca6-c8380f0884cb',
  hostedZoneId: HOSTED_ZONE_ID,
});
