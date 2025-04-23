// "use client";
// import { Stack, Box, TextField, Button } from "@mui/material";
// import { useState, useRef, useEffect } from "react";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth } from "../lib/firebase";
// import { useRouter } from "next/navigation";

// export default function Home() {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const bottomRef = useRef(null);
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//       } else {
//         router.push("/login");
//       }
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, [router]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = async () => {
//     setMessage("");
//     setMessages((messages) => [
//       ...messages,
//       { role: "user", content: message },
//       { role: "assistant", content: "" },
//     ]);
//     const response = fetch("/api/chat", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify([
//         {
//           role: "system",
//           content:
//             "You are a helpful job search assistant AI. Always return your response in clear paragraphs with headers or numbered lists. Avoid using bold symbols (**).",
//         },
//         ...messages,
//         { role: "user", content: message },
//       ]),
//     }).then(async (res) => {
//       const reader = res.body.getReader();
//       const decoder = new TextDecoder();

//       let result = "";
//       return reader.read().then(function processText({ done, value }) {
//         if (done) {
//           return result;
//         }
//         const text = decoder.decode(value || new Int8Array(), { stream: true });
//         setMessages((messages) => {
//           let lastMessage = messages[messages.length - 1];
//           let otherMessages = messages.slice(0, messages.length - 1);
//           return [
//             ...otherMessages,
//             {
//               ...lastMessage,
//               content: lastMessage.content + text,
//             },
//           ];
//         });
//         return reader.read().then(processText);
//       });
//     });
//   };

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       router.push("/login");
//     } catch (err) {
//       alert("Logout failed: " + err.message);
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         backgroundColor: "#fff",
//         paddingTop: 6,
//         paddingBottom: 6,
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "flex-start",
//       }}
//     >
//       <Stack
//         width="100%"
//         maxWidth="600px"
//         height="80vh"
//         borderRadius={3}
//         boxShadow={3}
//         backgroundColor="#e9defa"
//         p={3}
//         spacing={2}
//         sx={{ overflow: "hidden" }}
//       >
//         <Box display="flex" justifyContent="space-between" alignItems="center">
//           <h3>Welcome, {user?.displayName}</h3>
//           <Button onClick={handleLogout} variant="outlined" color="error">
//             Logout
//           </Button>
//         </Box>

//         <Stack spacing={2} flexGrow={1} overflow="auto" sx={{ pr: 1 }}>
//           {messages.map((message, index) => (
//             <Box
//               key={index}
//               display={"flex"}
//               justifyContent={
//                 message.role === "assistant" ? "flex-start" : "flex-end"
//               }
//             >
//               <Box
//                 sx={{
//                   backgroundColor:
//                     message.role === "assistant" ? "#d558c8" : "#1976d2",
//                   color: "#333",
//                   borderRadius: 2,
//                   padding: 2,
//                   maxWidth: "80%",
//                   wordWrap: "break-word",
//                 }}
//               >
//                 {message.content}
//               </Box>
//             </Box>
//           ))}
//           <div ref={bottomRef} />
//         </Stack>
//         <Stack direction={"row"} spacing={2}>
//           <TextField
//             label="Type your message..."
//             variant="outlined"
//             fullWidth
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 sendMessage();
//               }
//             }}
//           />
//           <Button variant="contained" onClick={sendMessage}>
//             send
//           </Button>
//         </Stack>
//       </Stack>
//     </Box>
//   );
// }

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

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: trimmedMessage },
      { role: "assistant", content: "" },
    ]);

    const response = fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          role: "system",
          content:
            "You are a helpful job search assistant AI. Always return your response in clear paragraphs with headers or numbered lists. Avoid using bold symbols (**).",
        },
        ...messages,
        { role: "user", content: trimmedMessage },
      ]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) return result;
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
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
                }}
              >
                {message.content}
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
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
