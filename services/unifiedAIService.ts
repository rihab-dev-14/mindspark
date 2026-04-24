
import { generateAdvisorResponse, generateAdvisorStream, processTask } from './geminiService';
import { generateOpenAIChatResponse, generateOpenAIChatStream } from './openaiService';

export type AIProvider = 'gemini' | 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const getActiveProvider = (): AIProvider => {
  const preferred = localStorage.getItem('mindspark_preferred_provider') as AIProvider;
  if (preferred === 'openai' && (localStorage.getItem('mindspark_openai_key') || process.env.OPENAI_API_KEY)) {
    return 'openai';
  }
  return 'gemini';
};

export const setPreferredProvider = (provider: AIProvider) => {
  localStorage.setItem('mindspark_preferred_provider', provider);
};

export const unifiedChatResponse = async (
  messages: ChatMessage[],
  systemInstruction?: string
): Promise<string> => {
  const provider = getActiveProvider();
  
  // Format messages for the specific provider if needed
  const history = messages.slice(0, -1);
  const lastMessage = messages[messages.length - 1].content;

  if (provider === 'openai') {
    // OpenAI takes full chat history + optional system prompt as first message
    const openAiMessages = systemInstruction 
      ? [{ role: 'system' as const, content: systemInstruction }, ...messages]
      : messages;
    return generateOpenAIChatResponse(openAiMessages);
  } else {
    // Gemini handles history explicitly in our helper
    // Actually our gemini wrapper handles history. Let's adapt.
    return generateAdvisorResponse(
      history.map(m => ({ role: m.role, content: m.content })),
      lastMessage
    );
  }
};

export async function* unifiedChatStream(
  messages: ChatMessage[],
  systemInstruction?: string
) {
  const provider = getActiveProvider();
  const history = messages.slice(0, -1);
  const lastMessage = messages[messages.length - 1].content;

  if (provider === 'openai') {
    const openAiMessages = systemInstruction 
      ? [{ role: 'system' as const, content: systemInstruction }, ...messages]
      : messages;
    yield* generateOpenAIChatStream(openAiMessages);
  } else {
    yield* generateAdvisorStream(
      history.map(m => ({ role: m.role, content: m.content })),
      lastMessage
    );
  }
}

export const unifiedProcessTask = async (
  text: string, 
  type: string, 
  language: string = 'English', 
  imageBase64?: string
): Promise<string> => {
  const provider = getActiveProvider();
  
  if (provider === 'openai') {
    // Basic task prompt for OpenAI (simulating what geminiService does)
    const prompt = `Task: ${type}\nLanguage: ${language}\nContent: ${text}`;
    return generateOpenAIChatResponse([
      { role: 'system', content: 'You are an AI processing engine. Return result in clear Markdown.' },
      { role: 'user', content: prompt }
    ]);
  } else {
    return processTask(text, type, language, imageBase64);
  }
};
