import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Lambda: getProductsList
    const getProductsList = new lambda.Function(this, 'GetProductsListHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsList.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // Lambda: getProductsById
    const getProductById = new lambda.Function(this, 'GetProductByIdHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductById.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'ProductServiceAPI', {
      restApiName: 'Product Service',
    });

    // /products endpoint
    const products = api.root.addResource('products');

    // GET /products -> getProductsList Lambda
    products.addMethod('GET', new apigateway.LambdaIntegration(getProductsList));

    // /products/{productId} endpoint
    const productById = products.addResource('{productId}');

    // GET /products/{productId} -> getProductById Lambda
    productById.addMethod('GET', new apigateway.LambdaIntegration(getProductById));
  }
}