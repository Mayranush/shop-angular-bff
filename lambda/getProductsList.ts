import { Handler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, ScanCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { products } from './mockData';

export const handler: Handler<void, APIGatewayProxyResult> = async () => {
  try {
    const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

    const command = new ScanCommand({
      TableName: 'Products',
    });

    const result = await dynamoDB.send(command);
    const items = result.Items || [];

     // 2. Fetch stock for each product
    const productsWithStock = await Promise.all(
      items.map(async (item) => {
        const id = item.id.S!;
        const title = item.title.S!;
        const description = item.description?.S || '';
        const price = Number(item.price.N);

        // 3. Get matching stock record from Stock table
        const stockResult = await dynamoDB.send(new GetItemCommand({
          TableName: 'Stock',
          Key: {
            product_id: { S: id }
          }
        }));

        const count = stockResult.Item?.count?.N
          ? Number(stockResult.Item.count.N)
          : 0;

        return {
          id,
          title,
          description,
          price,
          count
        };
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productsWithStock),
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
