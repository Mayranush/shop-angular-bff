import { Handler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { products } from './mockData';

export const handler: Handler<void, APIGatewayProxyResult> = async () => {
  try {
    const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

    const command = new ScanCommand({
      TableName: 'Products',
    });

    const result = await dynamoDB.send(command);
    const items = result.Items?.map(item => ({
      id: item.id.S,
      title: item.title.S,
      description: item.description?.S || null,
      price: Number(item.price.N),
    })) || [];

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: 'Failed to fetch products' }),
    };
  }
};
