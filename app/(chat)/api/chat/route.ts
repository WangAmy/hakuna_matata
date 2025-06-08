import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
const { text } = await generateText({
  model: openai('o3-mini'),
  prompt: 'What is love?',
});

import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getStreamIdsByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import type { Chat } from '@/lib/db/schema';
import { differenceInSeconds } from 'date-fns';
import { ChatSDKError } from '@/lib/errors';
import type { LanguageModelV1 } from 'ai';
import { trackEvent, getEventContext } from '@/lib/amplitude';

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL',
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const { id, message, selectedVisibilityType } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: message.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createDataStream({
      execute: (dataStream) => {
        const forcedModel = 'gpt-3.5-turbo' as unknown as LanguageModelV1;

        let result;
        try {
          result = streamText({
            model: forcedModel,
            system: systemPrompt({
              selectedChatModel: forcedModel as unknown as string,
              requestHints,
            }),
            messages,
            maxSteps: 5,
            experimental_activeTools: [],
            experimental_transform: smoothStream({ chunking: 'word' }),
            experimental_generateMessageId: generateUUID,
            tools: {
              getWeather,
              createDocument: createDocument({ session, dataStream }),
              updateDocument: updateDocument({ session, dataStream }),
              requestSuggestions: requestSuggestions({
                session,
                dataStream,
              }),
            },
            onFinish: async ({ response }) => {
              console.log('✅ onFinish triggered');
              console.log(
                '📦 GPT 回應內容:',
                JSON.stringify(response, null, 2),
              );

              trackEvent('gpt_response_finished', {
                chatId: id,
                messageCount: response.messages.length,
                ...getEventContext(),
              });

              if (session.user?.id) {
                try {
                  const assistantId = getTrailingMessageId({
                    messages: response.messages.filter(
                      (message) => message.role === 'assistant',
                    ),
                  });

                  if (!assistantId) {
                    throw new Error('No assistant message found!');
                  }

                  const [, assistantMessage] = appendResponseMessages({
                    messages: [message],
                    responseMessages: response.messages,
                  });

                  await saveMessages({
                    messages: [
                      {
                        id: assistantId,
                        chatId: id,
                        role: 'assistant',
                        parts: [
                          {
                            type: 'hotel_card',
                            data: {
                              name: 'Grand Hi Lai Hotel',
                              description: 'A luxury hotel...',
                              location: 'Kaohsiung',
                              starRating: 5,
                              guestRating: 9.2,
                              reviewCount: 1240,
                              price: '$3800',
                              maxOccupancy: 4,
                              imageUrl:
                                'https://cf.bstatic.com/xdata/images/hotel/max1024x768/12345678.jpg?k=abc123',
                              bookingUrl:
                                'https://www.booking.com/hotel/tw/grand-hi-lai.zh-tw.html',
                            },
                          },
                        ],
                        attachments: [],
                        createdAt: new Date(),
                      },
                    ],
                  });
                } catch (_) {
                  console.error('Failed to save chat');
                }
              }
            },
            experimental_telemetry: {
              isEnabled: isProductionEnvironment,
              functionId: 'stream-text',
            },
          });

          result.consumeStream();
          result.mergeIntoDataStream(dataStream, {
            sendReasoning: true,
          });
        } catch (error: any) {
          console.error(
            '❌ GPT API 請求失敗:',
            error?.response?.data || error?.message || error,
          );
        }
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = null;
    return new Response(stream);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error('Unhandled error in POST /api/chat:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
