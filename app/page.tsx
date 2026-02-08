"use client";

import { useState } from "react";

export default function Chat() {
    const [messages, setMessages] = useState([
        { 
            role: "model", 
            content: "Hi, my name is TARS. I am here to answer your questions. Please select which dataset you want answers for (DS-1 or DS-2)?" 
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

	async function sendMessage(e?: React.FormEvent) {
		if (e) e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage = { role: "user", content: input };
		
		const payload = {
			history: messages,
			message: input
		};

		setMessages(prev => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
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
            <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">EvolveNXT AI</h1>

            <div className="space-y-4 pb-28">
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
						className="flex-1 border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
				</div>
            </form>
        </div>
    );
}