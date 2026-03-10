"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Database, Globe } from 'lucide-react';

export default function UsageLogsPage() {
  // Line 11: Safety initialization as an empty array
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/v1/stats')
      .then(res => res.json())
      .then(data => {
        // Safety check: if data.recentLogs is missing, use an empty array []
        setLogs(data.recentLogs || []); 
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch logs:", err);
        setLogs([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <Link href="/" className="flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors w-fit">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Detailed Request Logs</h2>
            <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">Audit Trail & Token Accounting</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Model</th>
                  <th className="px-6 py-4">Prompt Snippet</th>
                  <th className="px-6 py-4">Tokens</th>
                  <th className="px-6 py-4">Cost</th>
                  <th className="px-6 py-4">Latency</th>
                  <th className="px-6 py-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic">
                      Querying Gateway Database...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                      No logs found. Run a request in the Playground to see data here.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-600 bg-slate-50 m-2 rounded">
                        {log.model}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 truncate max-w-[200px]">
                        {log.prompt}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {Math.round(log.tokensIn + log.tokensOut)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">
                        ${log.cost.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-1">
                        <Clock size={14} /> {log.latencyMs}ms
                      </td>
                      <td className="px-6 py-4">
                        {log.cacheHit ? (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">
                            <Database size={10} /> Semantic Hit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">
                            <Globe size={10} /> Live Request
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <footer className="mt-8 text-center text-slate-400 text-xs">
          Gateway Database: PostgreSQL • Infrastructure: Docker
        </footer>
      </div>
    </div>
  );
}