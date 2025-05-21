import { S3 } from 'aws-sdk';
import { S3Event, Context } from 'aws-lambda';
import * as csv from 'csv-parser';

const s3Client = new S3();
const bucket = process.env.BUCKET_NAME!;

export const handler = async (event:S3Event, context: Context):Promise<void> => {
  for (const record of event.Records) {
    const key = record.s3.object.key;

    const s3Stream = s3Client.getObject({ Bucket: bucket, Key: key }).createReadStream();
    const results: any[] = [];

    await new Promise((resolve, reject) => {
      s3Stream
        .pipe(csv())
        .on('data', (data) => {
          console.log('Parsed row:', data);
          results.push(data);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const destinationKey = key.replace('uploaded/', 'parsed/');
    await s3Client.copyObject({
      Bucket: bucket,
      CopySource: `${bucket}/${key}`,
      Key: destinationKey,
    }).promise();

    await s3Client.deleteObject({ Bucket: bucket, Key: key }).promise();
  }
};
