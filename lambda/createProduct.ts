import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'crypto';

export const handler: APIGatewayProxyHandler = async (event) => {
  const region = process.env.AWS_REGION || 'us-east-1';
  const dynamoDB = new DynamoDBClient({ region });
  const PRODUCTS_TABLE = 'Products';

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Request body is missing' }),
      };
    }

    const body = JSON.parse(event.body);

    if (!body.title || !body.price || isNaN(body.price)) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Invalid product data' }),
      };
    }

    const newItem = {
      id: { S: randomUUID() },
      title: { S: body.title },
      description: { S: body.description || '' },
      price: { N: String(body.price) },
    };

    await dynamoDB.send(new PutItemCommand({
      TableName: PRODUCTS_TABLE,
      Item: newItem,
    }));

    return {
      statusCode: 201,
      headers: corsHeaders(),
      body: JSON.stringify({
        id: newItem.id.S,
        title: newItem.title.S,
        description: newItem.description.S,
        price: Number(newItem.price.N),
      }),
    };

  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ message: 'Failed to create product' }),
    };
  }
};

const corsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
});
