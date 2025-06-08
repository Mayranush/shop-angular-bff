// Filename: authorizer-stack/handler.ts
export const handler = async(event: any) => {
    console.log("Event received:", JSON.stringify(event));
    try {
        const message = event.message || "no message provided";
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: `SUCCESS with message ${message} 🎉`,
            }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
}