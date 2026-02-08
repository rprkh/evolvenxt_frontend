"use client";

import { useState } from "react";

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
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                                m.role === "user" 
                                    ? "bg-indigo-500 text-white rounded-tr-none" 
                                    : "bg-slate-800 text-slate-100 rounded-tl-none"
                            }`}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}
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
						className="w-80 border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
							setDataset(selected);

							// Show confirmation system message immediately
							const agentName = selected || "TARS";
							const systemMessage = {
								role: "model",
								content: `You have selected ${agentName}. Please ask a question.`
							};
							setMessages(prev => [...prev, systemMessage]);

							// Reset datasetConfirmed if you still need it elsewhere
							setDatasetConfirmed(true); // mark confirmation sent
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

