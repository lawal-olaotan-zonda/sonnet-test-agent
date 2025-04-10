import * as https from 'https';

interface LambdaEvent {
    query?: string;
}

interface LambdaResponse {
    statusCode: number;
    body: string;
}

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
    const apiKey = process.env.CLAUDE_SONNET_API_KEY; // Ensure this is set in your environment
    const query = event.query || "default query";
    console.log(query);// Default query if none is provided
    console.log(apiKey)
    return {
        statusCode:200,
        body: JSON.stringify({data:'success'})
    }

};

