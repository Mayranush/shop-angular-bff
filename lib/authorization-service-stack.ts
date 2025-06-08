import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

export class AuthorizationServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

            // 1️⃣ Prepare environment variables for Lambda
            // Filtering out sensitive .env data
        const envVars: { [key: string]: string } = {
            Mayranush: process.env.Mayranush!,
        };

            // 2️⃣ Lambda function
        const basicAuthorizer = new lambda.Function(this, "BasicAuthorizerLambda", {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: "basicAuthorizer.handler",
            code: lambda.Code.fromAsset('lambda'),
            environment: envVars,
            timeout: cdk.Duration.seconds(5),
        });

            // 3️⃣ Allow API Gateway to invoke this Lambda
        basicAuthorizer.grantInvoke(new iam.ServicePrincipal("apigateway.amazonaws.com"));

            // 4️⃣ Output Lambda ARN for reference (cross-stack use)
        new cdk.CfnOutput(this, "BasicAuthorizerLambdaArn", {
            value: basicAuthorizer.functionArn,
            description: "ARN of the BasicAuthorizer Lambda",
            exportName: "BasicAuthorizerLambdaArn",
        });
    }
}
