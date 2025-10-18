exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    };

    // Handle preflight requests
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: "",
        };
    }

    try {
        const { query } = event.queryStringParameters || {};

        if (!query) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Query parameter is required" }),
            };
        }

        const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

        if (!unsplashAccessKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: "Unsplash API key not configured",
                }),
            };
        }

        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                query
            )}&per_page=10&client_id=${unsplashAccessKey}`
        );

        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error("Error searching Unsplash:", error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: "Failed to search images",
                details: error.message,
            }),
        };
    }
};
