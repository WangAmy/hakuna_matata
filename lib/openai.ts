// lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  // organization: 'org_xxx', // 可選
  // project: 'proj_xxx',     // 通常不用填，除非你有設定多個 project
});
