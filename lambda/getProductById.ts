import { APIGatewayProxyHandler } from 'aws-lambda';
import { products } from './mockData'; // Import your mock data

export const handler: APIGatewayProxyHandler = async (event) => {
  const productId = event.pathParameters?.productId; // Get the productId from path parameters

  if (!productId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: 'Missing productId' }),
    };
  }

  const product = products.find(p => p.id === productId);

  if (!product) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: 'Product not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  };
};
