//  node scripts/seed-dynamodb.js

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: 'us-east-1' });

// Sample product data
const products = [
  {
        "count": 4,
        "description": "Short Product Description1",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
        "price": 2.4,
        "title": "ProductOne"
      },
      {
        "count": 6,
        "description": "Short Product Description3",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a0",
        "price": 10,
        "title": "ProductNew"
      },
      {
        "count": 7,
        "description": "Short Product Description2",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
        "price": 23,
        "title": "ProductTop"
      },
      {
        "count": 12,
        "description": "Short Product Description7",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
        "price": 15,
        "title": "ProductTitle"
      },
      {
        "count": 7,
        "description": "Short Product Description2",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
        "price": 23,
        "title": "Product"
      },
      {
        "count": 8,
        "description": "Short Product Description4",
        "id": "7567ec4b-b10c-48c5-9345-fc73348a80a1",
        "price": 15,
        "title": "ProductTest"
      },
      {
        "count": 2,
        "description": "Short Product Descriptio1",
        "id": "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
        "price": 23,
        "title": "Product2"
      },
      {
        "count": 3,
        "description": "Short Product Description7",
        "id": "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
        "price": 15,
        "title": "ProductName"
      }
];

async function seedTables() {
  for (const product of products) {
    const id = uuidv4();

    // Insert into Products table
    const putProduct = new PutItemCommand({
      TableName: 'Products',
      Item: {
        id: { S: id },
        title: { S: product.title },
        description: { S: product.description },
        price: { N: product.price.toString() },
        count: { N: product.count.toString() },
      },
    });

    // Insert into Stock table
    const putStock = new PutItemCommand({
      TableName: 'Stock',
      Item: {
        product_id: { S: id },
      },
    });

    try {
      await client.send(putProduct);
      console.log(`✅ Product inserted: ${product.title}`);

      await client.send(putStock);
      console.log(`📦 Stock inserted for product: ${product.title}`);
    } catch (err) {
      console.error(`❌ Error inserting ${product.title}:`, err);
    }
  }

  console.log('🎉 Done seeding DynamoDB tables.');
}

seedTables();
