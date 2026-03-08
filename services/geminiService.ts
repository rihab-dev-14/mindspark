import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION_ADVISOR = `
You are 'Sparky', an enthusiastic, empathetic, and highly effective AI Study Advisor for MindSpark.
Your goal is to help students focus, understand complex topics, and stay motivated.
Keep responses concise, encouraging, and actionable. Use markdown for formatting.
Tone: Friendly, supportive, professional but approachable.
`;

const SYSTEM_INSTRUCTION_TASK = `
You are an AI processing engine for MindSpark.
Your task is to process text and images based on the user's specific request.
Return the result in clear Markdown format.
`;

export const generateAdvisorResponse = async (history: { role: string, content: string }[], message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ADVISOR,
        temperature: 0.7,
      },
    });
    return response.text || "I'm having a little trouble thinking right now. Can you ask again?";
  } catch (error) {
    console.error("Gemini Advisor Error:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

export const processTask = async (text: string, type: string, language: string = 'English', imageBase64?: string): Promise<string> => {
  let promptText = "";
  
  switch(type) {
    case 'Summarize':
      promptText = `Please summarize the following content. Keep it concise and capture the main points. Language: ${language}.\n\nContent:\n${text}`;
      break;
    case 'Generate Notes':
      promptText = `Convert the following content into structured study notes (bullet points and key takeaways). Language: ${language}.\n\nContent:\n${text}`;
      break;
    case 'Proofread':
      promptText = `Proofread the following text. Correct grammar and spelling, and suggest improvements for clarity. Language: ${language}.\n\nText:\n${text}`;
      break;
    case 'Translate':
      promptText = `Translate the following content into ${language}.\n\nContent:\n${text}`;
      break;
    case 'Simplify':
      promptText = `Explain the following content like I am 5 years old. Use simple analogies. Language: ${language}.\n\nContent:\n${text}`;
      break;
    case 'Quiz':
      promptText = `Generate a 5-question multiple choice quiz based on the following content. Include the answer key at the bottom. Language: ${language}.\n\nContent:\n${text}`;
      break;
    case 'Flashcards':
      promptText = `Generate a set of flashcards based on the content. Format each as "**Front:** [Concept] - **Back:** [Definition]". Generate at least 5-10 cards. Language: ${language}.\n\nContent:\n${text}`;
      break;
    case 'Essay Outline':
      promptText = `Create a detailed essay outline based on the topic or content provided. Include Introduction (Hook, Thesis), Body Paragraphs (Topic Sentences, Supporting Points), and Conclusion. Language: ${language}.\n\nContent/Topic:\n${text}`;
      break;
    case 'Analyze Image':
      promptText = `Analyze this image. Describe what you see, extract any text, and explain key concepts. Language: ${language}.\n\nAdditional Context:\n${text}`;
      break;
    default:
      promptText = text;
  }

  try {
    const parts: any[] = [{ text: promptText }];
    
    if (imageBase64) {
      // Extract base64 data if it contains the prefix
      const base64Data = imageBase64.includes('base64,') 
        ? imageBase64.split('base64,')[1] 
        : imageBase64;

      parts.unshift({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming jpeg for simplicity, though the API detects it usually
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_TASK,
        temperature: 0.3,
      },
    });
    return response.text || "Failed to process content.";
  } catch (error) {
    console.error("Gemini Task Error:", error);
    throw new Error("Failed to process task");
  }
};