import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import './ChatInterface.css';

export default function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleShare = () => {
    if (!conversation || conversation.messages.length === 0) return;

    let text = `LLM Council Conversation\n${'='.repeat(40)}\n\n`;

    for (const msg of conversation.messages) {
      if (msg.role === 'user') {
        text += `USER:\n${msg.content}\n\n`;
      } else {
        if (msg.stage1) {
          text += `--- Stage 1: Individual Responses ---\n`;
          for (const r of msg.stage1) {
            text += `[${r.model}]\n${r.response}\n\n`;
          }
        }
        if (msg.stage3) {
          text += `--- Final Synthesis (${msg.stage3.model}) ---\n${msg.stage3.response}\n\n`;
        }
      }
    }

    navigator.clipboard.writeText(text).then(() => {
      alert('Conversation copied to clipboard!');
    }).catch(() => {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<pre>${text.replace(/</g, '&lt;')}</pre>`);
      }
    });
  };

  if (!conversation) {
    return (
      <div className="chat-interface">
        <div className="empty-state">
          <h2>Welcome to LLM Council</h2>
          <p>Create a new conversation to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      {conversation.messages.length > 0 && (
        <div className="chat-toolbar">
          <button className="share-btn" onClick={handleShare} title="Copy conversation to clipboard">
            Share
          </button>
        </div>
      )}
      <div className="messages-container">
        {conversation.messages.length === 0 ? (
          <div className="empty-state">
            <h2>Start a conversation</h2>
            <p>Ask a question to consult the LLM Council</p>
          </div>
        ) : (
          conversation.messages.map((msg, index) => (
            <div key={index} className="message-group">
              {msg.role === 'user' ? (
                <div className="user-message">
                  <div className="message-label">You</div>
                  <div className="message-content">
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="assistant-message">
                  <div className="message-label">LLM Council</div>

                  {/* Progress Stepper — visible while any stage is loading */}
                  {(msg.loading?.stage1 || msg.loading?.stage2 || msg.loading?.stage3) && (
                    <div className="progress-stepper">
                      <div className={`step ${msg.stage1 ? 'completed' : msg.loading?.stage1 ? 'active' : 'pending'}`}>
                        <div className="step-indicator">
                          {msg.stage1 ? (
                            <svg viewBox="0 0 20 20" fill="currentColor" className="check-icon"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                          ) : msg.loading?.stage1 ? (
                            <div className="step-spinner"></div>
                          ) : (
                            <span className="step-number">1</span>
                          )}
                        </div>
                        <div className="step-label">Responses</div>
                      </div>
                      <div className="step-connector-wrapper">
                        <div className={`step-connector ${msg.stage1 ? 'filled' : ''}`}></div>
                      </div>
                      <div className={`step ${msg.stage2 ? 'completed' : msg.loading?.stage2 ? 'active' : 'pending'}`}>
                        <div className="step-indicator">
                          {msg.stage2 ? (
                            <svg viewBox="0 0 20 20" fill="currentColor" className="check-icon"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                          ) : msg.loading?.stage2 ? (
                            <div className="step-spinner"></div>
                          ) : (
                            <span className="step-number">2</span>
                          )}
                        </div>
                        <div className="step-label">Peer Review</div>
                      </div>
                      <div className="step-connector-wrapper">
                        <div className={`step-connector ${msg.stage2 ? 'filled' : ''}`}></div>
                      </div>
                      <div className={`step ${msg.stage3 ? 'completed' : msg.loading?.stage3 ? 'active' : 'pending'}`}>
                        <div className="step-indicator">
                          {msg.stage3 ? (
                            <svg viewBox="0 0 20 20" fill="currentColor" className="check-icon"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                          ) : msg.loading?.stage3 ? (
                            <div className="step-spinner"></div>
                          ) : (
                            <span className="step-number">3</span>
                          )}
                        </div>
                        <div className="step-label">Synthesis</div>
                      </div>
                    </div>
                  )}

                  {/* Stage 1 */}
                  {msg.stage1 && <Stage1 responses={msg.stage1} />}

                  {/* Stage 2 */}
                  {msg.stage2 && (
                    <Stage2
                      rankings={msg.stage2}
                      labelToModel={msg.metadata?.label_to_model}
                      aggregateRankings={msg.metadata?.aggregate_rankings}
                    />
                  )}

                  {/* Stage 3 */}
                  {msg.stage3 && <Stage3 finalResponse={msg.stage3} />}
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Consulting the council...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {conversation.messages.length === 0 && (
        <form className="input-form" onSubmit={handleSubmit}>
          <textarea
            className="message-input"
            placeholder="Ask your question... (Shift+Enter for new line, Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={3}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isLoading}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
