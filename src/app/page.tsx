"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  DollarSign, 
  Zap, 
  Database, 
  Send, 
  FileText, 
  ChevronRight,
  Loader2 
} from 'lucide-react';
import { CostChart } from '../components/CostChart';

export default function GatewayDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // Fetch dashboard stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:3001/v1/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const testProxy = async () => {
    if (!prompt) return;
    
    setResponse("");
    setIsStreaming(true);
    setIsCached(false);

    try {
      const res = await fetch('http://localhost:3001/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: prompt }], 
          stream: true,
          model: "gemini-2.5-flash" 
        })
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.cached) setIsCached(true);
              setResponse(prev => prev + (data.content || ""));
            } catch (e) {
              // Handle partial JSON chunks if they occur
            }
          }
        }
      }
    } catch (err) {
      setResponse("Error: Could not connect to the gateway.");
    } finally {
      setIsStreaming(false);
      fetchStats(); // Refresh charts after request
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Gateway Control</h1>
            <p className="text-slate-500 mt-1">Infrastructure monitoring & Semantic caching engine</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/usage" 
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <FileText size={16} /> View Audit Logs
            </Link>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-xs font-bold border border-emerald-100 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Gateway Active
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total API Spend" 
            value={`$${stats?.totalCost?.toFixed(4) || "0.0000"}`} 
            icon={<DollarSign size={20}/>} 
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard 
            title="Cache Hit Rate" 
            value={`${stats?.cacheHitRate?.toFixed(1) || "0.0"}%`} 
            icon={<Database size={20}/>} 
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <StatCard 
            title="P99 Latency" 
            value="142ms" 
            icon={<Zap size={20}/>} 
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard 
            title="Throughput" 
            value={`${stats?.recentLogs?.length || 0} reqs`} 
            icon={<Activity size={20}/>} 
            color="text-rose-600"
            bg="bg-rose-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Section - Integration of CostChart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Operational Spend</h3>
                <p className="text-xs text-slate-400 uppercase font-semibold">Daily aggregate cost in USD</p>
              </div>
              <select className="text-xs border rounded-md p-1 bg-slate-50 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <CostChart data={stats?.dailyStats || []} />
            </div>
          </div>

          {/* Proxy Playground */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-bold text-lg text-slate-800">Live Proxy</h3>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">SSE Enabled</span>
            </div>
            
            <div className="relative flex-grow flex flex-col">
              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-4 h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="Send a prompt through the gateway..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              
              <button 
                onClick={testProxy}
                disabled={isStreaming || !prompt}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
              >
                {isStreaming ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                {isStreaming ? "Streaming Response..." : "Execute Request"}
              </button>

              <div className="mt-6 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gateway Output</span>
                  {isCached && (
                    <span className="flex items-center gap-1 text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                      <Database size={10} /> SEMANTIC CACHE HIT
                    </span>
                  )}
                </div>
                <div className="flex-grow p-4 bg-slate-900 text-blue-100 rounded-xl text-sm font-mono overflow-y-auto max-h-[200px] leading-relaxed border border-slate-800 shadow-inner">
                  {response || (
                    <span className="text-slate-600 italic">No data received. Waiting for execution...</span>
                  )}
                  {isStreaming && <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-blue-400"></span>}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <footer className="pt-8 border-t border-slate-200 flex justify-between items-center text-slate-400 text-xs">
          <p>© 2024 LLM Edge Gateway • B2B Infrastructure</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Zap size={12}/> Redis Edge Cache</span>
            <span className="flex items-center gap-1"><Database size={12}/> Qdrant Vector Engine</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Sub-component for Stats
function StatCard({ title, value, icon, color, bg }: { title: string, value: string, icon: any, color: string, bg: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-blue-200 transition-colors">
      <div className={`p-3 ${bg} ${color} rounded-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}