import { APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from "aws-lambda";

exports.handler = async (event: APIGatewayRequestAuthorizerEvent) => {

    const token = event.headers?.Authorization;
    if (!token) {
        console.log("No token provided");
        throw new Error("Unauthorized");
    }

    const encoded = token.split(" ")[1];
    const decoded = Buffer.from(encoded, "base64").toString();
    const [username, password] = decoded.split(":");

    console.log(`Decoded username: ${username}`);

      // ⚠️ Directly use environment variables from Lambda configuration
    const expectedPassword = process.env[username];
    if (expectedPassword && expectedPassword === password) {
        console.log("Authorized!");
        return generatePolicy(username, "Allow", event.methodArn);
    } else {
        console.log("Forbidden!");
        return generatePolicy(username, "Deny", event.methodArn);
    }
};

const generatePolicy = (principalId: string, effect: "Allow" | "Deny", resource: string) => {
    return {
        principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
        {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: resource,
        },
        ],
        },
    };
};
