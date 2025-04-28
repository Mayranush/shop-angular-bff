import { APIGatewayProxyHandler } from 'aws-lambda';
import { products } from './mockData';

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};