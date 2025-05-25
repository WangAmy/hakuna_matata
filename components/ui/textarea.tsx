import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'> & { autoFocus?: boolean }
>(({ className, autoFocus, ...props }, ref) => {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useImperativeHandle(ref, () => innerRef.current!);

  React.useEffect(() => {
    if (autoFocus && innerRef.current) {
      innerRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={innerRef}
      spellCheck={false} // ✅ 明確關閉自動拼字檢查，避免 server/client 不一致
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
