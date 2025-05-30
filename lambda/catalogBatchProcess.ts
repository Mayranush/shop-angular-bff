//import { SQSEvent } from "aws-lambda";
//
//export const handler = async(event: SQSEvent) => {
//    console.log("Received message:", event.Records[0].body);
//}

//import { SNSEvent } from "aws-lambda";
//
//export const handler = async(event: SNSEvent) => {
//    console.log("Received message:", event.Records[0].Sns.Message);
//}


import { SQSEvent } from 'aws-lambda';
import { DynamoDB, SNS } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamo = new DynamoDB.DocumentClient();
const sns = new SNS();

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE_NAME!;
const TOPIC_ARN = process.env.CREATE_PRODUCT_TOPIC_ARN!;

export const handler = async (event: SQSEvent) => {
    for (const record of event.Records) {
        try {
            const product = JSON.parse(record.body);
            const item = {
                id: uuidv4(),
                ...product
            };

            await dynamo.put({
                TableName: PRODUCTS_TABLE,
                Item: item
            }).promise();

            await sns.publish({
                TopicArn: TOPIC_ARN,
                Subject: 'New Product Created',
                Message: `A new product was created: ${JSON.stringify(item)}`
            }).promise();
} catch (err) {
            console.error('Failed to process message', record, err);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Batch processed successfully' })
    };
};
