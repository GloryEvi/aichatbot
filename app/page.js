// "use client";
// import { Stack, Box, TextField, Button } from "@mui/material";
// import { useState } from "react";
// import "./page.module.css";

// export default function Home() {
//   const [messages, setMessages] = useState([]);

//   const [message, setMessage] = useState("");

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
//           content: "You are a helpful job search assistant AI.",
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

//   return (
//     <Box
//       width="100vw"
//       height="100vh"
//       display="flex"
//       flexDirection="column"
//       justifyContent="center"
//       alignItems="center"
//     >
//       <Stack
//         direction={"column"}
//         width={"600px"}
//         height={"700px"}
//         border={"1px solid blue"}
//         p={2}
//         spacing={2}
//       >
//         <Stack
//           direction={"column"}
//           spacing={2}
//           flexGrow={1}
//           overflow={"auto"}
//           maxHeight={"100%"}
//         >
//           {messages.map((message, index) => (
//             <Box
//               key={index}
//               display={"flex"}
//               justifyContent={
//                 message.role === "assistant" ? "flex-start" : "flex-end"
//               }
//             >
//               <Box
//                 bgcolor={
//                   message.role === "assistant"
//                     ? "primary.main"
//                     : "secondary.main"
//                 }
//                 color={"pink"}
//                 borderRadius={16}
//                 p={3}
//               >
//                 {message.content}
//               </Box>
//             </Box>
//           ))}
//         </Stack>
//         <Stack direction={"row"} spacing={2}>
//           <TextField
//             label="message"
//             fullWidth
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
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
import { useState, useRef, useEffect } from "react"; // <-- added useRef and useEffect

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const bottomRef = useRef(null); // <-- create ref

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // <-- scroll when messages change

  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          role: "system",
          content:
            "You are a helpful job search assistant AI.Always return your response in clear paragraphs with headers or numbered lists. Avoid using bold symbols (**).",
        },
        ...messages,
        { role: "user", content: message },
      ]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

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
                  color: "#333",
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
          <div ref={bottomRef} /> {/* <-- auto scroll anchor */}
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
            send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
