import { api } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, fadeInUp } from '../../lib/animations';
import { Button } from '../../components/ui/Button';
import { Search, Plus, MessageSquare, Send, Bot, User, Sparkles, Paperclip, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = '/ai';

export default function QueriesPage() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (token) fetchConversations();
  }, [token]);

  const fetchConversations = async () => {
    try {
      const res = await api.get(`${API_URL}/conversations`);
      if (res.data.success) {
        setConversations(res.data.data);
        if (res.data.data.length > 0 && !activeQueryId) {
          setActiveQueryId(res.data.data[0].id);
        } else if (res.data.data.length === 0 && !activeQueryId) {
          handleNewQuery();
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  useEffect(() => {
    if (activeQueryId && !activeQueryId.startsWith('new-')) {
      fetchMessages(activeQueryId);
    } else if (activeQueryId?.startsWith('new-')) {
      setMessages([{ role: 'assistant', content: "Hello! I'm TaxOS, your AI tax consultant. How can I help you today? Ask me about GST filing, income tax slabs, or business compliance." }]);
    }
  }, [activeQueryId]);

  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const res = await api.get(`${API_URL}/conversations/${conversationId}/messages`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeQuery = activeQueryId?.startsWith('new-') 
    ? { id: activeQueryId, title: 'New Conversation', updatedAt: new Date().toISOString() }
    : conversations.find(c => c.id === activeQueryId);

  const handleSend = async () => {
    if (!input.trim() || !activeQuery || isSending) return;
    
    const userMessage = input;
    setInput('');
    setIsSending(true);
    
    // Optimistic update
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const payload = activeQueryId?.startsWith('new-') 
        ? { message: userMessage }
        : { message: userMessage, conversationId: activeQueryId };

      const res = await api.post(`${API_URL}/chat`, payload);
      
      if (res.data.success) {
        const { conversationId, message } = res.data.data;
        
        if (activeQueryId?.startsWith('new-')) {
          setActiveQueryId(conversationId);
          fetchConversations();
        } else {
          // If title was generated for an existing conversation, fetching again would update it
          fetchConversations();
        }
        
        setMessages(prev => [...prev, message]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleNewQuery = () => {
    const newId = `new-${Date.now()}`;
    setActiveQueryId(newId);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col h-full bg-[#0D0D0F]"
    >
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Query List */}
        <div className={`w-full md:w-[380px] flex-shrink-0 border-r border-white/5 bg-[#111111] flex flex-col transition-all ${activeQueryId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-display font-bold text-white">Queries</h1>
              <Button onClick={handleNewQuery} className="bg-[#C9A94B]/10 text-[#C9A94B] hover:bg-[#C9A94B]/20 px-3 py-2">
                <Plus size={18} />
                <span className="hidden sm:inline ml-2">New</span>
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#C9A94B]/50 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((query) => (
              <div 
                key={query.id}
                onClick={() => setActiveQueryId(query.id)}
                className={`p-5 border-b border-white/5 cursor-pointer transition-all ${activeQueryId === query.id ? 'bg-white/5 border-l-2 border-l-[#C9A94B]' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-slate-500">{query.id.substring(0, 8)}...</span>
                  <span className="text-xs text-slate-500">{formatDate(query.updatedAt)}</span>
                </div>
                <h4 className={`text-sm font-medium line-clamp-2 ${activeQueryId === query.id ? 'text-[#C9A94B]' : 'text-slate-200'}`}>
                  {query.title}
                </h4>
              </div>
            ))}
            
            {conversations.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No conversations yet. Start a new query!
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Chat Interface */}
        <div className={`flex-1 flex flex-col bg-[#0a0a0c] transition-all min-w-0 w-full ${!activeQueryId ? 'hidden md:flex' : 'flex'}`}>
          {activeQuery ? (
            <>
              {/* Chat Header */}
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-[#111111] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 md:gap-4 w-full min-w-0">
                  <button 
                    onClick={() => setActiveQueryId(null)}
                    className="md:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 shrink-0"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#C9A94B] to-[#E8C96B] flex items-center justify-center shadow-[0_0_15px_rgba(201,169,75,0.2)]">
                    <Sparkles className="text-black" size={20} />
                  </div>
                  <div className="min-w-0 flex-1 pr-2">
                    <h2 className="text-white font-medium text-sm md:text-base truncate">{activeQuery.title}</h2>
                    <p className="text-xs text-slate-400 truncate">TaxOS AI Assistant</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#C9A94B]" size={32} />
                  </div>
                ) : (
                  messages.map((msg: any, i: number) => (
                    <motion.div 
                      key={i}
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#C9A94B]' : 'bg-[#111] border border-[#C9A94B]/30 text-[#C9A94B]'}`}>
                        {msg.role === 'user' ? <User size={16} className="text-black" /> : <Bot size={16} />}
                      </div>
                      <div className={`p-3 md:p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm break-words min-w-0 ${msg.role === 'user' ? 'bg-[#C9A94B] text-black rounded-tr-none font-medium' : 'bg-[#161618] border border-white/10 text-slate-300 rounded-tl-none'}`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))
                )}
                
                {/* Typing Indicator */}
                {isSending && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex gap-4 max-w-[85%]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#111] border border-[#C9A94B]/30 text-[#C9A94B] flex items-center justify-center flex-shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="p-4 rounded-2xl bg-[#161618] border border-white/10 rounded-tl-none flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#C9A94B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[#C9A94B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[#C9A94B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 md:p-4 border-t border-white/5 bg-[#111111]">
                <div className="flex items-end gap-2 bg-[#0a0a0c] border border-white/10 rounded-2xl p-2 focus-within:border-[#C9A94B]/50 transition-colors">
                  <button className="p-3 text-slate-400 hover:text-[#C9A94B] transition-colors rounded-xl hover:bg-white/5 shrink-0">
                    <Paperclip size={20} />
                  </button>
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 resize-none max-h-32 py-3 px-2 text-sm custom-scrollbar"
                    rows={1}
                    disabled={isSending}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={isSending || !input.trim()}
                    className={`p-3 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSending || !input.trim() 
                        ? 'bg-[#111] border border-white/10 text-slate-500' 
                        : 'bg-[#C9A94B] text-black hover:bg-[#E8C96B]'
                    }`}
                  >
                    <Send size={18} className="ml-1" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Query Selected</h3>
              <p className="text-slate-400 text-sm max-w-sm">Select a query from the sidebar to view the conversation or start a new AI session.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
