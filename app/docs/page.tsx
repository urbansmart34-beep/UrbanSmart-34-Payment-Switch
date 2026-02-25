export default function ApiDocsPage() {
    return (
        <div className="flex-1 flex flex-col xl:flex-row min-h-full">
            {/* Center Column: Documentation */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 xl:p-12 pb-32">
                <div className="max-w-3xl mx-auto">
                    {/* API Keys Section */}
                    <div className="mb-12 bg-white dark:bg-[#161920] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-[#1c1f26]">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">API Credentials</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Use these keys to authenticate your API requests.</p>
                            </div>
                            <button className="text-xs font-medium px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition">Regenerate Keys</button>
                        </div>
                        <div className="p-6 grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-center">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Client ID</label>
                                <div className="flex items-center gap-2 group">
                                    <code className="flex-1 font-mono text-sm bg-slate-100 dark:bg-[#111318] px-3 py-2 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">us_live_8392849283928392</code>
                                    <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-[#282d39]" title="Copy">
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-center">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Secret Key</label>
                                <div className="flex items-center gap-2 group relative">
                                    <div className="flex-1 relative">
                                        <code className="block w-full font-mono text-sm bg-slate-100 dark:bg-[#111318] px-3 py-2 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 blur-[4px] select-none transition-all duration-300 group-hover:blur-0">sk_live_9283748291029384_sec</code>
                                        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 group-hover:hidden font-medium">Hover to reveal</div>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-[#282d39]" title="Copy">
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Documentation Content */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 dark:bg-green-500/10 dark:text-green-400 rounded uppercase">POST</span>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create a Payment</h1>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                                To charge a credit card or other payment source, you create a <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary">Payment</code> object. The payment is processed immediately, and the status is returned in the response.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Parameters</h3>
                            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-[#1c1f26] text-slate-500 dark:text-slate-400 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 w-1/3">Field</th>
                                            <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-[#111318]">
                                        <tr>
                                            <td className="px-4 py-4 align-top">
                                                <div className="font-mono text-primary font-semibold">amount</div>
                                                <div className="text-xs text-slate-400 mt-1">integer, required</div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                                                The amount intended to be collected from the payment source in the smallest currency unit.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-4 align-top">
                                                <div className="font-mono text-primary font-semibold">currency</div>
                                                <div className="text-xs text-slate-400 mt-1">string, required</div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                                                Three-letter ISO currency code, in lowercase. Must be a supported currency.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Interactive Code Snippets */}
            <div className="hidden xl:flex w-[450px] bg-[#0d1117] flex-col border-l border-slate-800 shrink-0">
                {/* Code Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#161b22]">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Request</span>
                    </div>
                    <div className="flex bg-slate-800 rounded p-0.5">
                        <button className="px-2 py-1 text-xs font-medium text-white bg-slate-600 rounded shadow-sm">cURL</button>
                        <button className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white transition-colors">Node</button>
                        <button className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white transition-colors">Python</button>
                        <button className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white transition-colors">Go</button>
                    </div>
                </div>

                {/* Code Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-sm leading-relaxed">
                    <div className="text-slate-300">
                        <span className="text-pink-400">curl</span> <span className="text-blue-300">https://api.urbansmart.com/v2.1/payments</span> \<br />
                        &nbsp;&nbsp;<span className="text-pink-400">-u</span> us_live_8392849283928392: \<br />
                        &nbsp;&nbsp;<span className="text-pink-400">-d</span> <span className="text-green-400">amount</span>=2000 \<br />
                        &nbsp;&nbsp;<span className="text-pink-400">-d</span> <span className="text-green-400">currency</span>=usd \<br />
                        &nbsp;&nbsp;<span className="text-pink-400">-d</span> <span className="text-green-400">source</span>=tok_visa \<br />
                        &nbsp;&nbsp;<span className="text-pink-400">-d</span> <span className="text-green-400">description</span>=<span className="text-yellow-300">"Charge for order #8839"</span>
                    </div>
                </div>

                {/* Response Header */}
                <div className="flex items-center justify-between px-4 py-2 border-y border-slate-800 bg-[#161b22]">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response</span>
                    <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded">200 OK</span>
                </div>

                {/* Response Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-sm leading-relaxed bg-[#0d1117]">
                    <pre className="text-slate-300 m-0">
                        {`{
  "id": "pay_1J2k3L4m5N6o7P8q9R",
  "object": "payment",
  "amount": 2000,
  "amount_captured": 2000,
  "amount_refunded": 0,
  "currency": "usd",
  "status": "succeeded",
  "source": {
    "id": "card_1K2j3h4g5f6d",
    "brand": "Visa",
    "last4": "4242",
    "exp_month": 8,
    "exp_year": 2026
  },
  "captured": true,
  "created": 1678892341
}`}
                    </pre>
                </div>
                <div className="p-4 border-t border-slate-800 bg-[#161b22]">
                    <button className="w-full flex items-center justify-center gap-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        Run in Playground
                    </button>
                </div>
            </div>
        </div>
    );
}
