"use client";

import { useState } from "react";

export default function Chat() {
	const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
	const [input, setInput] = useState("");

	async function sendMessage() {
		if (!input.trim()) return;

		const userMessage = { role: "user", content: input };
		setMessages(prev => [...prev, userMessage]);
		setInput("");

		const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message: input })
		});

		const data = await res.json();

		setMessages(prev => [
			...prev,
			{ role: "assistant", content: data.response }
		]);
	}

	return (
		<div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">EvolveNXT AI</h1>

			<div className="flex-1 overflow-y-auto space-y-2">
				{messages.map((m, i) => (
					<div
						key={i}
						className={`p-2 rounded ${
							m.role === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200"
						}`}
					>
						{m.content}
					</div>
				))}
			</div>

			<div className="flex mt-4">
				<input
					className="flex-1 border p-2 rounded-l"
					value={input}
					onChange={e => setInput(e.target.value)}
					placeholder="Type a message..."
				/>
				<button
					className="bg-black text-white px-4 rounded-r"
					onClick={sendMessage}
				>
					Send
				</button>
			</div>
		</div>
	);
}
