import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { aiService } from '../services/health.service';
import { Button } from '../components/Button';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: history } = useQuery({
    queryKey: ['chat-history'],
    queryFn: aiService.getHistory,
  });

  useEffect(() => {
    if (history && messages.length === 0) {
      const restored: Message[] = [];
      for (const h of [...history].reverse()) {
        restored.push({ id: h.id + '-user', role: 'user', content: h.message, timestamp: new Date(h.createdAt) });
        restored.push({ id: h.id + '-ai', role: 'assistant', content: h.response, timestamp: new Date(h.createdAt) });
      }
      if (restored.length > 0) setMessages(restored);
    }
  }, [history]);

  const chatMutation = useMutation({
    mutationFn: (message: string) => aiService.chat(message),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + '-ai', role: 'assistant', content: data.response, timestamp: new Date() },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + '-err', role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() },
      ]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">AI Health Assistant</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Chat about your health concerns</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--accent))]">
                <svg className="h-8 w-8 text-[hsl(var(--accent-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-medium">How can I help you today?</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Ask me anything about your health and wellness</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`mt-1 text-xs ${msg.role === 'user' ? 'text-white/70' : 'text-[hsl(var(--muted-foreground))]'}`}>
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}

          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-[hsl(var(--muted))] px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[hsl(var(--muted-foreground))]" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[hsl(var(--muted-foreground))]" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[hsl(var(--muted-foreground))]" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type your message..."
          className="flex-1 rounded-xl border border-[hsl(var(--input))] bg-transparent px-4 py-3 text-sm outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
          aria-label="Chat message input"
        />
        <Button onClick={handleSend} isLoading={chatMutation.isPending} disabled={!input.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
