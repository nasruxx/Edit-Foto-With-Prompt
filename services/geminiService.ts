export const editImageWithGemini = async (
    base64ImageData: string,
    prompt: string
): Promise<string> => {
    
    const response = await fetch('/.netlify/functions/edit-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            base64ImageData,
            prompt,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.imageUrl) {
        throw new Error("API did not return an image URL.");
    }
    
    return result.imageUrl;
};
