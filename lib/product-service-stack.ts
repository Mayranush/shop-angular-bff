import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const getProductsList = new lambda.Function(this, 'GetProductsListHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'getProductsList.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: 'Products'
      }
    });

    const getProductById = new lambda.Function(this, 'GetProductByIdHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductById.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    const createProduct = new lambda.Function(this, 'CreateProductHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'createProduct.handler',
      code: lambda.Code.fromAsset('lambda'),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      environment: {
        TABLE_NAME: 'Products',
      }
    });

    getProductsList.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
    getProductById.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
    createProduct.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

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

    products.addMethod('POST', new apigateway.LambdaIntegration(createProduct, {
      proxy: true,
    }));

    const productById = products.addResource('{productId}');

    productById.addMethod('GET', new apigateway.LambdaIntegration(getProductById, {
      proxy: true,
    }));

    const productsTable = new dynamodb.Table(this, "ProductsTable", {
      tableName: 'Products',
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      }
    });

    const stockTable = new dynamodb.Table(this, "StockTable", {
      tableName: 'Stock',
      partitionKey: {
        name: "product_id",
        type: dynamodb.AttributeType.STRING,
      }
    });

    productsTable.grantReadData(getProductsList);
    stockTable.grantReadData(getProductsList);

    productsTable.grantReadData(getProductById);
    stockTable.grantReadData(getProductById);

    productsTable.grantWriteData(createProduct);
  }
}
