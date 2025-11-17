import type { Handler } from '@netlify/functions';
import { GoogleGenAI, Modality } from "@google/genai";

const parseBase64 = (base64String: string): { mimeType: string; data: string } => {
    const match = base64String.match(/^data:(image\/[a-z]+);base64,(.*)$/);
    if (!match || match.length < 3) {
        throw new Error("Invalid base64 string format. Expected data:image/[type];base64,[data]");
    }
    return { mimeType: match[1], data: match[2] };
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'POST' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing request body' }),
      };
    }

    const { base64ImageData, prompt } = JSON.parse(event.body);

    if (!base64ImageData || !prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing base64ImageData or prompt in request body' }),
      };
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const { mimeType, data } = parseBase64(base64ImageData);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: data,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
            const base64ImageBytes: string = part.inlineData.data;
            const resultUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            return {
              statusCode: 200,
              body: JSON.stringify({ imageUrl: resultUrl }),
            };
        }
    }

    throw new Error("No image was found in the Gemini API response.");

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to edit image.', details: errorMessage }),
    };
  }
}
