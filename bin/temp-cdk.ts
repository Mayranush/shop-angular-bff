#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service-stack';
import { ImportServiceStack } from '../lib/import-service-stack';
// import { ProductSqsStack } from '../lib/product-sqs/product-sqs-stack';
// import { ProductSnsStack } from '../lib/product-sns/product-sns-stack';

const app = new cdk.App();
const productStack = new ProductServiceStack(app, 'ProductServiceStack', {});
new ImportServiceStack(app, 'ImportServiceStack', {catalogQueue: productStack.catalogItemsQueue});
// new ProductSqsStack(app, "ProductSqsStack");
// new ProductSnsStack(app, "ProductSnsStack");