import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppMessage, Issue } from '../types';
import {
  X,
  Send,
  CheckCheck,
  Building2,
  Bot,
  Sparkles,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

interface WhatsAppBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrackingCode?: string;
  onSelectIssue?: (issue: Issue) => void;
}

export const WhatsAppBotModal: React.FC<WhatsAppBotModalProps> = ({
  isOpen,
  onClose,
  initialTrackingCode,
  onSelectIssue,
}) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: 'msg_1',
      sender: 'bot',
      text: '🏛️ *Welcome to GHMC CIR Official WhatsApp Assistant* (గ్రేటర్ హైదరాబాద్ మున్సిపల్ కార్పొరేషన్ / హైదరాబాద్)\n\nI can help you track real-time complaint status, manage automated email & WhatsApp status alerts, and access GHMC municipal helpline contacts.\n\nSend your tracking code e.g. *CS-HYD-50001* or reply *MENU*.\n\n⚠️ *Notice:* New civic issues require mandatory photo proof and GPS location to be filed via the CIR web portal.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action_buttons: [
        { label: '🔍 Check CS-HYD-50001', action: 'send_text', payload: 'CS-HYD-50001' },
        { label: '🔔 Subscribe Alerts Guide', action: 'send_text', payload: 'SUBSCRIBE' },
        { label: '📞 GHMC Helpline', action: 'send_text', payload: 'HELPLINE' },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const lastAutoSentRef = useRef<string | null>(null);

  const generateMsgId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  useEffect(() => {
    if (isOpen && initialTrackingCode && lastAutoSentRef.current !== initialTrackingCode) {
      lastAutoSentRef.current = initialTrackingCode;
      const cleanCode = `CS-HYD-${initialTrackingCode.replace(/^(CS-HYD-|CS-PUN-)/i, '')}`;
      handleSendMessage(cleanCode);
    }
    if (!isOpen) {
      lastAutoSentRef.current = null;
    }
  }, [isOpen, initialTrackingCode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: WhatsAppMessage = {
      id: generateMsgId('usr'),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/whatsapp/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          phone: '+91 98490 12345',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setIsTyping(false);

      const botMsg: WhatsAppMessage = {
        id: generateMsgId('bot'),
        sender: 'bot',
        text: data.reply || 'Thank you for reaching out to CIR Hyderabad.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action_buttons: data.action_buttons,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('WhatsApp Bot fetch info:', err?.message || err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: generateMsgId('bot_err'),
          sender: 'bot',
          text: '🏛️ *GHMC CIR Bot* is online! Reply *MENU* or send your complaint code e.g. *CS-HYD-50001*.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleActionButton = async (btn: { label: string; action: string; payload?: string }) => {
    if (btn.action === 'send_text' && btn.payload) {
      handleSendMessage(btn.payload);
      return;
    }

    if ((btn.action === 'toggle_email' || btn.action === 'toggle_whatsapp') && btn.payload) {
      try {
        const payloadKey = btn.action === 'toggle_email' ? 'notify_email' : 'notify_whatsapp';
        const res = await fetch(`/api/issues/${btn.payload}/subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [payloadKey]: true,
            reporter_email: 'citizen@hyderabad.gov.in',
            reporter_phone: '+91 98490 12345',
          }),
        });
        const data = await res.json();
        if (data.issue) {
          handleSendMessage(`CS-HYD-${data.issue.tracking_code.replace(/^(CS-HYD-|CS-PUN-)/i, '')}`);
        }
      } catch (e) {
        console.error('Toggle error:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[620px] text-slate-100">
        {/* WhatsApp Header Bar */}
        <div className="bg-emerald-800 px-4 py-3 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white font-bold">
              <Bot className="size-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm tracking-wide">GHMC CIR Bot</h3>
                <ShieldCheck className="size-4 text-emerald-200 shrink-0" />
              </div>
              <p className="text-[11px] text-emerald-100/90 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>Official GHMC Automated Helpline • Online</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition cursor-pointer">
            <X className="size-5 shrink-0" />
          </button>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.text.split('\n').map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>

                {/* Interactive Action Buttons */}
                {msg.action_buttons && msg.action_buttons.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    {msg.action_buttons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => handleActionButton(btn)}
                        className="w-full bg-slate-800 hover:bg-emerald-900/50 text-emerald-300 border border-slate-700 hover:border-emerald-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Sparkles className="size-3 text-emerald-400 shrink-0" />
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[9px] text-right ${msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 w-fit">
              <Bot className="size-4 text-emerald-400 animate-spin shrink-0" />
              <span>GHMC Bot is typing response...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Bottom Input Field */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send CS-HYD-50001 or type message..."
              className="flex-1 bg-slate-950 text-white border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition cursor-pointer"
            >
              <Send className="size-4 shrink-0" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
