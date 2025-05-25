import type { UIMessage } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { Greeting } from './greeting';
import { memo } from 'react';
import type { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { useMessages } from '@/hooks/use-messages';
import HotelCard from '@/components/ui/HotelCard';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers['status'];
  votes: Array<Vote> | undefined;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
  isArtifactVisible: boolean;
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    chatId,
    status,
  });

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 relative"
    >
      {messages.map((message, index) => {
        const part = message.parts?.[0];

        if (!part) return null;

        let parsed: any;
        try {
          parsed = typeof part === 'string' ? JSON.parse(part) : part;
          console.log('🧩 parsed part:', parsed);
        } catch (error) {
          console.warn('❌ JSON parsing failed:', error);

          // fallback 顯示純文字訊息
          return (
            <PreviewMessage
              key={message.id}
              chatId={chatId}
              message={message}
              isLoading={status === 'streaming' && messages.length - 1 === index}
              vote={votes?.find((vote) => vote.messageId === message.id)}
              setMessages={setMessages}
              reload={reload}
              isReadonly={isReadonly}
              requiresScrollPadding={
                hasSentMessage && index === messages.length - 1
              }
            />
          );
        }

        if (parsed?.type === 'hotel_card') {
          const hotelData = parsed.data;
          console.log('🏨 hotelData:', hotelData);

          return (
            <HotelCard
              key={message.id}
              name={hotelData.name ?? 'No Name'}
              description={hotelData.description ?? ''}
              location={hotelData.location ?? ''}
              starRating={hotelData.starRating ?? 0}
              guestRating={hotelData.guestRating ?? 0}
              reviewCount={hotelData.reviewCount ?? 0}
              price={hotelData.price ?? ''}
              maxOccupancy={hotelData.maxOccupancy ?? 0}
              imageUrl={hotelData.imageUrl ?? '/default-hotel.jpg'}
              bookingUrl={hotelData.bookingUrl}
            />
          );
        }

        return (
          <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={status === 'streaming' && messages.length - 1 === index}
            vote={votes?.find((vote) => vote.messageId === message.id)}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
            requiresScrollPadding={
              hasSentMessage && index === messages.length - 1
            }
          />
        );
      })}

      {status === 'submitted' &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
