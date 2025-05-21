import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const s3 = new S3();
const bucket = process.env.BUCKET_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: 'Missing file name' }),
    };
  }

  const params = {
    Bucket: bucket,
    Key: `uploaded/${fileName}`,
    Expires: 300,
    ContentType: 'text/csv',
  };

  const signedUrl = s3.getSignedUrl('putObject', params);

  return {
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: signedUrl }),
  };
};
