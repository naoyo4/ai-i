import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '@/components/chat/MessageBubble';

describe('MessageBubble', () => {
  it('renders user message content', () => {
    render(
      <MessageBubble
        message={{
          id: '1',
          role: 'user',
          content: 'Hello world',
          createdAt: new Date(),
        }}
      />
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(
      <MessageBubble
        message={{
          id: '2',
          role: 'assistant',
          content: 'Hi there!',
          createdAt: new Date(),
        }}
      />
    );
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });
});
