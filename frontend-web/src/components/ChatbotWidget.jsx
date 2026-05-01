import React, { useRef, useState } from 'react';
import { MdChat, MdClose, MdSend } from 'react-icons/md';
import { chatbotApi } from '../api/chatbotApi';
import { useAuth } from '../context/AuthContext';

const ChatbotWidget = () => {
  const { authUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I can help you with resources, bookings, equipment, and tickets.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const conversationIdRef = useRef(`chat-${Date.now()}`);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatbotApi.ask({
        message: text,
        conversationId: conversationIdRef.current,
        userId: authUser?.id?.toString() || '',
      });

      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: res.data.reply || 'No reply received.' },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: error?.response?.data?.reply || 'Chatbot is not available right now.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition"
        >
          <MdChat className="text-2xl" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[90vw] h-[520px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold">Campus Assistant</p>
              <p className="text-xs text-indigo-100">Smart Campus Chatbot</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-white/20">
              <MdClose className="text-xl" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600'
                            }`}
                    >
                        {msg.text}
                    </div>
              </div>
            ))}

            {loading && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Assistant is typing...
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about bookings..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50"
            >
              <MdSend />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;