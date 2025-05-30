import { S3, SQS } from 'aws-sdk';
import { S3Event, Context } from 'aws-lambda';
import * as csv from 'csv-parser';

const s3Client = new S3();
const sqsClient = new SQS();

const bucket = process.env.BUCKET_NAME!;
const queueUrl = process.env.SQS_URL!;

export const handler = async (event: S3Event, context: Context): Promise<void> => {
  for (const record of event.Records) {
    const key = record.s3.object.key;
    const s3Stream = s3Client.getObject({ Bucket: bucket, Key: key }).createReadStream();

      // Buffer all parsed rows
    const parsedRecords: any[] = [];

    await new Promise<void>((resolve, reject) => {
      s3Stream
        .pipe(csv())
        .on('data', (data) => {
          console.log('Parsed row:', data);
          parsedRecords.push(data);
        })
        .on('end', resolve)
        .on('error', reject);
  });

console.log('parsed Records:', parsedRecords);
      // Send to SQS one-by-one (or consider batching)
  for (const item of parsedRecords) {
    try {
      await sqsClient.sendMessage({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(item),
      }).promise();
    } catch (err) {
      console.error('Failed to send message for record:', item, err);
    }
  }

      // Move file to 'parsed/' and delete original
  const destinationKey = key.replace('uploaded/', 'parsed/');
    await s3Client.copyObject({
    Bucket: bucket,
    CopySource: `${bucket}/${key}`,
    Key: destinationKey,
  }).promise();

    await s3Client.deleteObject({ Bucket: bucket, Key: key }).promise();
  }
};
