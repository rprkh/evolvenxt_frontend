"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Chat() {
    const [messages, setMessages] = useState([
        { 
            role: "model", 
            content: "Hi, my name is TARS. I am here to answer your questions. Please select which dataset you want answers for (DS-1 or DS-2) from the dropdown. Alternatively, you can leave it as TARS for general conversations." 
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
	const [dataset, setDataset] = useState(""); // "" = general chat
	const [datasetConfirmed, setDatasetConfirmed] = useState(false);


	async function sendMessage(e?: React.FormEvent) {
		if (e) e.preventDefault();
		if (!input.trim() || isLoading) return;

		// Normal user message
		const userMessage = { role: "user", content: input };
		setMessages(prev => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const payload = {
				history: [...messages, userMessage], // include actual user message
				message: input,
				dataset: dataset || null
			};

			const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});

			const data = await res.json();

			setMessages(prev => [
				...prev,
				{ role: "model", content: data.response }
			]);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}


    return (
        <div className="flex flex-col max-w-2xl mx-auto p-4 font-sans">
            <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-700">
				<h1 className="max-w-2xl mx-auto p-4 text-2xl font-bold text-slate-900 dark:text-white">
					EvolveNXT AI
				</h1>
			</div>

            <div className="space-y-4 pt-20 pb-28">
                {messages.map((m, i) => {
					let chartData = null;
					let displayContent = m.content;

					// Check if content is a chart JSON
					if (m.role === "model" && m.content.startsWith('{"type": "chart"')) {
						try {
							const parsed = JSON.parse(m.content);
							displayContent = parsed.content;
							chartData = parsed.chart_data;
						} catch (e) {
							console.error("JSON parse error", e);
						}
					}
					return (
						<div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
							<div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
								m.role === "user" ? "bg-indigo-500 text-white rounded-tr-none" : "bg-slate-800 text-slate-100 rounded-tl-none"
							}`}>
								{displayContent}
							</div>

							
							
							{chartData && (
								<div className="w-full h-64 mt-2 bg-slate-900 p-4 rounded-xl border border-slate-700 overflow-hidden">
									<ResponsiveContainer width="100%" height="100%">
									<LineChart data={chartData}>
										<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
										<XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
										<YAxis stroke="#94a3b8" fontSize={12} />
										<Tooltip
										contentStyle={{
											backgroundColor: "#1e293b",
											border: "none",
											color: "#e5e7eb",
										}}
										/>
										<Legend />

										{(() => {
										const agentKeys = Object.keys(chartData[0] || {}).filter(
											(key) => key !== "year"
										);

										const generateColors = (count: number): string[] =>
											Array.from({ length: count }, (_, i) => {
												const hue = Math.round((360 / count) * i);
												return `hsl(${hue}, 70%, 55%)`;
											});

										const colors = generateColors(agentKeys.length);

										return agentKeys.map((agent, idx) => (
											<Line
											key={agent}
											type="linear"
											dataKey={agent}
											stroke={colors[idx]}
											strokeWidth={2}
											dot={{ r: 3 }}
											activeDot={{ r: 5 }}
											/>
										));
										})()}
									</LineChart>
									</ResponsiveContainer>
								</div>
							)}
						</div>
					);
				})}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl rounded-tl-none text-xs animate-pulse">
                            AI is thinking...
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={sendMessage} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-slate-200 dark:border-slate-700 p-4">
                <div className="max-w-2xl mx-auto flex gap-2">
					<input
						className="w-118 border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
						value={input}
						onChange={e => setInput(e.target.value)}
						placeholder="Type a message..."
						disabled={isLoading}
					/>
					<button
						type="submit"
						disabled={isLoading}
						className={`px-6 py-2 rounded-lg font-medium transition-all ${
							isLoading 
							? "bg-slate-400 cursor-not-allowed" 
							: "bg-black text-white hover:bg-slate-800 active:scale-95"
						}`}
					>
						{isLoading ? "..." : "Send"}
					</button>

					<select
						className="border border-slate-300 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
						value={dataset}
						onChange={(e) => {
							const selected = e.target.value;
							const agentName = selected || "TARS";
							
							const confirmationMsg = {
								role: "model",
								content: `You have selected ${agentName}. Please ask a question.`
							};

							setDataset(selected);
							setMessages(prev => [...prev, confirmationMsg]);
						}}

					>
						<option className="bg-slate-800 text-white" value="">TARS</option>
						<option className="bg-slate-800 text-white" value="DS-1">DS-1</option>
						<option className="bg-slate-800 text-white" value="DS-2">DS-2</option>
					</select>

				</div>
            </form>
        </div>
    );
}

