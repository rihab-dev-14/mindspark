
import { OpenAI } from 'openai';

export interface FineTuningLimit {
  max_total_jobs: number;
  max_concurrent_jobs: number;
  active_jobs: number;
}

export const getOpenAIModelLimits = async (providedKey?: string): Promise<Record<string, FineTuningLimit>> => {
  // Use provided key, or fall back to specific OPENAI env var.
  // Explicitly NOT using process.env.API_KEY to avoid confusion with Gemini keys.
  const apiKey = providedKey || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API Key is missing. Please enter it in the settings.");
  }

  try {
    const response = await fetch('https://api.openai.com/v1/fine_tuning/model_limits', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch OpenAI limits:", error);
    throw error;
  }
};

export const generateOpenAIChatResponse = async (
  messages: { role: 'user' | 'assistant' | 'system', content: string }[],
  config?: { baseURL?: string, model?: string, apiKey?: string }
): Promise<string> => {
  const baseURL = config?.baseURL || localStorage.getItem('mindspark_openai_base_url') || 'https://api.ai.cc/v1';
  const model = config?.model || localStorage.getItem('mindspark_openai_model') || 'openai/gpt-5-2';
  const apiKey = config?.apiKey || localStorage.getItem('mindspark_openai_key') || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API Key is missing.");
  }

  const openai = new OpenAI({
    baseURL,
    apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const result = await openai.chat.completions.create({
      model,
      messages,
    });
    return result.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI Chat Error:", error);
    throw error;
  }
};

export async function* generateOpenAIChatStream(
  messages: { role: 'user' | 'assistant' | 'system', content: string }[],
  config?: { baseURL?: string, model?: string, apiKey?: string }
) {
  const baseURL = config?.baseURL || localStorage.getItem('mindspark_openai_base_url') || 'https://api.ai.cc/v1';
  const model = config?.model || localStorage.getItem('mindspark_openai_model') || 'openai/gpt-5-2';
  const apiKey = config?.apiKey || localStorage.getItem('mindspark_openai_key') || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API Key is missing.");
  }

  const openai = new OpenAI({
    baseURL,
    apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("OpenAI Stream Error:", error);
    yield " [Error: OpenAI Connection lost] ";
  }
}
