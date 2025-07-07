"use client";

import { Stack, Box, TextField, Button } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessage = (content) => {
    if (!content) return "";

    // Format only for display, after streaming is complete
    return (
      content
        // Clean up any remaining markdown
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/#{1,6}\s*/g, "")
        .replace(/`/g, "")

        // Fix spacing issues
        .replace(/\.(?=[A-Z])/g, ". ")
        .replace(/:(?=[A-Z])/g, ": ")
        .replace(/\.(?=[a-z])/g, ". ")
        .replace(/:(?=[a-z])/g, ": ")

        // Add line breaks for lists
        .replace(/(\d+\.)/g, "\n$1")
        .replace(/(-\s)/g, "\n- ")

        // Clean up whitespace
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isTyping) return;

    setMessage("");
    setIsTyping(true);
    setMessages((messages) => [
      ...messages,
      { role: "user", content: trimmedMessage },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            role: "system",
            content:
              "You are a professional job search assistant. Provide clear, well-formatted responses with proper spacing and line breaks. Only answer questions related to job searching, career advice, resume writing, and interview preparation. Use numbered lists and bullet points with hyphens, never asterisks or hashtags.",
          },
          ...messages,
          { role: "user", content: trimmedMessage },
        ]),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      const processText = async ({ done, value }) => {
        if (done) {
          setIsTyping(false);
          return;
        }

        const text = decoder.decode(value || new Int8Array(), { stream: true });
        const cleanedText = formatMessage(text); // Use the new formatter

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });

        const nextChunk = await reader.read();
        return processText(nextChunk);
      };

      const firstChunk = await reader.read();
      await processText(firstChunk);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((messages) => {
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ];
      });
      setIsTyping(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        paddingTop: 6,
        paddingBottom: 6,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Stack
        width="100%"
        maxWidth="600px"
        height="80vh"
        borderRadius={3}
        boxShadow={3}
        backgroundColor="#e9defa"
        p={3}
        spacing={2}
        sx={{ overflow: "hidden" }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <h3>Welcome, {user?.displayName}</h3>
          <Button onClick={handleLogout} variant="outlined" color="error">
            Logout
          </Button>
        </Box>

        <Stack spacing={2} flexGrow={1} overflow="auto" sx={{ pr: 1 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              display={"flex"}
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                sx={{
                  backgroundColor:
                    message.role === "assistant" ? "#d558c8" : "#1976d2",
                  color: "#fff",
                  borderRadius: 2,
                  padding: 2,
                  maxWidth: "80%",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap", // Preserves line breaks
                  lineHeight: "1.6", // Better line spacing
                  fontSize: "0.95rem", // Slightly smaller, more readable
                }}
              >
                {formatMessage(message.content) ||
                  (isTyping && message.role === "assistant" ? "Typing..." : "")}
              </Box>
            </Box>
          ))}
          <div ref={bottomRef} />
        </Stack>

        <Stack direction={"row"} spacing={2}>
          <TextField
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={isTyping}
          />
          <Button variant="contained" onClick={sendMessage} disabled={isTyping}>
            {isTyping ? "..." : "Send"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
