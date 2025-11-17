import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

const parseBase64 = (base64String: string): { mimeType: string; data: string } => {
    const match = base64String.match(/^data:(image\/[a-z]+);base64,(.*)$/);
    if (!match || match.length < 3) {
        throw new Error("Invalid base64 string format. Expected data:image/[type];base64,[data]");
    }
    return { mimeType: match[1], data: match[2] };
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { base64ImageData, prompt } = req.body;

  if (!base64ImageData || !prompt) {
    return res.status(400).json({ error: 'Missing base64ImageData or prompt in request body' });
  }
  
  try {
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
            return res.status(200).json({ imageUrl: resultUrl });
        }
    }

    throw new Error("No image was found in the Gemini API response.");

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: 'Failed to edit image.', details: errorMessage });
  }
}
