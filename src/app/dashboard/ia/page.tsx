'use client';

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "./styles.css";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';


export default function Iachat() {
    const [messages, setMessages] = useState([
        { role: "system", content: "You are a helpful assistant." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState("mistralai/devstral-small");
    const { toast } = useToast();

    const MistralSmall1Api = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
    const QwenApi4BKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setLoading(true);


        if (model == "mistralai/devstral-small") {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${MistralSmall1Api}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model,
                        messages: newMessages
                    })
                });

                const data = await response.json();
                const aiMessage = data?.choices?.[0]?.message || { role: "assistant", content: "⚠️ No response from AI" };
                setMessages([...newMessages, aiMessage]);
            } catch (error) {
                console.error("Error fetching AI response:", error);
                setMessages([...newMessages, { role: "assistant", content: "Error: no response from AI." }]);
            } finally {
                setLoading(false);
            }

        } else if (model == "qwen/qwen3-4b:free") {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${QwenApi4BKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model,
                        messages: newMessages
                    })
                });

                const data = await response.json();
                const aiMessage = data?.choices?.[0]?.message || { role: "assistant", content: "⚠️ No response from AI" };
                setMessages([...newMessages, aiMessage]);
            } catch (error) {
                console.error("Error fetching AI response:", error);
                setMessages([...newMessages, { role: "assistant", content: "Error: no response from AI." }]);
            } finally {
                setLoading(false);
            }

        } else if (model == "anthropic/claude-3-haiku") {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${QwenApi4BKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model,
                        messages: newMessages
                    })
                });

                const data = await response.json();
                const aiMessage = data?.choices?.[0]?.message || { role: "assistant", content: "⚠️ No response from AI" };
                setMessages([...newMessages, aiMessage]);
            } catch (error) {
                console.error("Error fetching AI response:", error);
                setMessages([...newMessages, { role: "assistant", content: "Error: no response from AI." }]);
            } finally {
                setLoading(false);
            }
        }
        else {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'The model is under maintenance. Please try again later.',
            });
        }

    };

    return (
        <main className="p-10 m-10 flex items-center justify-center min-w-10">
            <div className="">
                {/* Conversación */}
                <div className="mb-4 p-4 rounded-md min-h-[300px] overflow-y-auto border border-gray-300">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            style={{ marginBottom: "0.5rem", textAlign: msg.role === "user" ? "right" : "left" }}
                        >
                            <strong>{msg.role === "user" ? "You" : "LumiAI"}:</strong>
                            <div style={{ marginTop: "0.25rem" }} className="markdown">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {loading && <div><Loader2 className="h-8 w-8 animate-spin" /></div>}
                </div>

                {/* Input + Botón + Modelo */}
                <div style={{ display: "flex", gap: "0.5rem" }} className="items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        style={{ flex: 1, padding: "0.5rem" }}
                    />
                    <Button onClick={sendMessage} style={{ padding: "0.5rem 1rem" }}>Send</Button>

                    {/* Dropdown para mostrar/cambiar modelo */}
                    <div className="ml-5">
                        <DropdownMenu>
                            <DropdownMenuTrigger>{model}</DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Choose Model</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setModel("mistralai/devstral-small")}>
                                    Mistral Small 1.1
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setModel("qwen/qwen3-4b:free")}>
                                    Qwen3 4B
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setModel("anthropic/claude-3-haiku")}>
                                    Claude 3 Haiku
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </main>
    );
}
