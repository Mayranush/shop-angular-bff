import { APIGatewayProxyHandler } from 'aws-lambda';
import { products } from './mockData';

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(products),
  };
};