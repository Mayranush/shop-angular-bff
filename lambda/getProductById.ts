import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  DynamoDBClient,
  GetItemCommand
} from '@aws-sdk/client-dynamodb';

export const handler: APIGatewayProxyHandler = async (event) => {
  const region = process.env.AWS_REGION || 'us-east-1';
  const dynamoDB = new DynamoDBClient({ region });

  // Get table names from environment variables
  const PRODUCTS_TABLE = 'Products';
  const STOCK_TABLE = 'Stock';

  const productId = event.pathParameters?.productId;

  if (!productId) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ message: 'Missing productId' }),
    };
  }

  try {
    // 1. Get product by ID from Products table
    const productResult = await dynamoDB.send(new GetItemCommand({
      TableName: PRODUCTS_TABLE,
      Key: {
        id: { S: productId }
      }
    }));

    if (!productResult.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    const productItem = productResult.Item;
    const product = {
      id: productItem.id.S!,
      title: productItem.title.S!,
      description: productItem.description?.S || '',
      price: Number(productItem.price.N),
    };

    // 2. Get corresponding stock from Stock table
    const stockResult = await dynamoDB.send(new GetItemCommand({
      TableName: STOCK_TABLE,
      Key: {
        product_id: { S: productId }
      }
    }));

    const count = stockResult.Item?.count?.N
      ? Number(stockResult.Item.count.N)
      : 0;

    // 3. Combine and return
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        ...product,
        count
      }),
    };

  } catch (err) {
    console.error('Error retrieving product by ID:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to fetch product data' }),
    };
  }
};

const corsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
});
