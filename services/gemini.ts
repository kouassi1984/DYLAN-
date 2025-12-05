import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Merges a jersey onto a player using Gemini.
 * @param playerBase64 - The base64 string of the player image (without prefix).
 * @param jerseyBase64 - The base64 string of the jersey image (without prefix).
 * @param mimeType - The mime type of the images (assuming same for simplicity, or mostly jpeg/png).
 * @param prompt - The specific instruction.
 */
export const fusionJersey = async (
  playerBase64: string,
  jerseyBase64: string,
  prompt: string,
  playerMimeType: string = 'image/jpeg',
  jerseyMimeType: string = 'image/jpeg'
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: "Context: The first image is the 'Target Player'. The second image is the 'Reference Jersey'. Task: " + prompt
          },
          {
            inlineData: {
              data: playerBase64,
              mimeType: playerMimeType,
            },
          },
          {
            inlineData: {
              data: jerseyBase64,
              mimeType: jerseyMimeType,
            },
          },
        ],
      },
    });

    // Extract the image from the response
    let textResponse = '';
    
    // Iterate through all candidates and parts
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
        if (part.text) {
          textResponse += part.text + ' ';
        }
      }
    }

    // If no image found, throw the text response which usually contains the refusal reason
    throw new Error(textResponse.trim() || "No image generated. The model may have refused the request due to safety filters.");
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};