// lib/ai/providers.ts
import { customProvider } from 'ai';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';

export const myProvider = customProvider({
  languageModels: {
    'chat-model': openai('gpt-4'),
    'chat-model-reasoning': openai('gpt-4'),
    'title-model': openai('gpt-4'),
    'artifact-model': openai('gpt-4'),
  },
});
