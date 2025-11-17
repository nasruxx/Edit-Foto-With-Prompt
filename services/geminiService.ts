
import { GoogleGenAI, Modality } from "@google/genai";

const parseBase64 = (base64String: string): { mimeType: string; data: string } => {
    const match = base64String.match(/^data:(image\/[a-z]+);base64,(.*)$/);
    if (!match || match.length < 3) {
        // Fallback for non-data URL base64 strings if necessary, assuming a default mimeType
        // For this app, we strictly expect a data URL.
        throw new Error("Invalid base64 string format. Expected data:image/[type];base64,[data]");
    }
    return { mimeType: match[1], data: match[2] };
};

export const editImageWithGemini = async (
    base64ImageData: string,
    prompt: string
): Promise<string> => {
    // This API key is provided by the environment.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const { mimeType, data } = parseBase64(base64ImageData);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // "nano banana"
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
    
    // As per docs, find the image part in the response
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
            const base64ImageBytes: string = part.inlineData.data;
            // Reconstruct the data URL for rendering in the browser
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }

    throw new Error("No image was found in the Gemini API response.");
};
