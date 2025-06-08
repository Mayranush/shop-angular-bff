import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';

interface ImportServiceStackProps extends cdk.StackProps {
  catalogQueue: sqs.Queue;
}

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ImportServiceStackProps) {
    super(scope, id, props);

    const { catalogQueue } = props;

        // Create S3 bucket
    const bucket = new s3.Bucket(this, 'ImportServiceBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [s3.HttpMethods.PUT],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
        },
      ],
    });

        // Lambda to handle GET /import
    const importProductsFile = new lambda.Function(this, 'ImportProductsFileLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'importProductsFile.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    importProductsFile.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
    bucket.grantReadWrite(importProductsFile);

        // Create API Gateway
    const api = new apigateway.RestApi(this, 'ImportApi', {
      restApiName: 'Import Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

        // ⭐️ Import the Lambda Authorizer ARN from the AuthorizationServiceStack
    const basicAuthorizerArn = cdk.Fn.importValue("BasicAuthorizerLambdaArn");
    const basicAuthorizer = lambda.Function.fromFunctionArn(
    this,
          "BasicAuthorizerFunction",
    basicAuthorizerArn
    );

        // Create the Lambda Authorizer for API Gateway
    const lambdaAuthorizer = new apigateway.RequestAuthorizer(this, "ImportServiceLambdaAuthorizer", {
      handler: basicAuthorizer,
      identitySources: [apigateway.IdentitySource.header("Authorization")],
      resultsCacheTtl: cdk.Duration.seconds(0), // Disable caching for testing
    });

        // Create /import resource with GET method protected by Lambda Authorizer
    const importResource = api.root.addResource('import');
    importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFile, {
      proxy: true,
    }), {
      authorizer: lambdaAuthorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

        // Lambda to parse file events
    const importFileParser = new lambda.Function(this, 'ImportFileParserLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'importFileParser.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
        SQS_URL: catalogQueue.queueUrl,
      },
    });

    catalogQueue.grantSendMessages(importFileParser);
    bucket.grantReadWrite(importFileParser);
    importFileParser.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParser),
      { prefix: 'uploaded/' }
    );
  }
}
