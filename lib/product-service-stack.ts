import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const getProductsList = new lambda.Function(this, 'GetProductsListHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsList.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    const getProductById = new lambda.Function(this, 'GetProductByIdHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductById.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    getProductsList.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
    getProductById.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

    const api = new apigateway.RestApi(this, 'ProductServiceAPI', {
      restApiName: 'Product Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const products = api.root.addResource('products');

    products.addMethod('GET', new apigateway.LambdaIntegration(getProductsList, {
      proxy: true,
    }));

    const productById = products.addResource('{productId}');

    productById.addMethod('GET', new apigateway.LambdaIntegration(getProductById, {
      proxy: true,
    }));
  }
}
