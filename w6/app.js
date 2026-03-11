const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const BOT_NAME = process.env.BOT_NAME || "ChatBot";
const BOT_TRIGGER = process.env.BOT_TRIGGER || "@bot";
const BOT_REPLY_MODE = (process.env.BOT_REPLY_MODE || "mention").toLowerCase();
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({apiKey: process.env.OPENAI_API_KEY})
    : null;

//Setup static public folder
app.use(express.static("public"));

const users = new Set();

async function getBotResponse(message, username) {
    if (!openai) {
        return "OpenAI API key is missing.";
    }

    const cleanedMessage = message.replace(BOT_TRIGGER, "").trim() || message;

    const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
            {
                role: "system",
                content: "You are a helpful and concise chat assistant.",
            },
            {
                role: "user",
                content: `${username}: ${cleanedMessage}`,
            },
        ],
        temperature: 0.7,
    });

    return completion.choices?.[0]?.message?.content?.trim() || "I couldn't generate a response.";
}

io.on("connection", (socket)=>{
    console.log("User Connected");

    //Event for chat message
    socket.on("chat message", async (msg)=>{
        const userMessage = (msg || "").toString().trim();
        if (!userMessage) {
            return;
        }

        const username = socket.username || "Anonymous";

        console.log(`Message from ${username}: ${userMessage}`);
        io.emit("chat message", {
            sender: username,
            text: userMessage,
            type: "user",
            timestamp: Date.now(),
        });

        const shouldReply = BOT_REPLY_MODE === "all" || userMessage.toLowerCase().includes(BOT_TRIGGER.toLowerCase());
        if (!shouldReply) {
            return;
        }

        io.emit("bot typing", true);

        try {
            const botReply = await getBotResponse(userMessage, username);
            io.emit("chat message", {
                sender: BOT_NAME,
                text: botReply,
                type: "bot",
                timestamp: Date.now(),
            });
        } catch (error) {
            console.error("OpenAI error:", error.message);
            io.emit("chat message", {
                sender: BOT_NAME,
                text: "I hit an error while generating a reply. Please try again.",
                type: "bot",
                timestamp: Date.now(),
            });
        } finally {
            io.emit("bot typing", false);
        }
    });

    //Event for set users
    socket.on("set username", (username)=>{
        socket.username = (username || "Anonymous").trim() || "Anonymous";
        users.add(socket.username);
        io.emit("user list", Array.from(users));
        io.emit("chat message", {
            sender: "System",
            text: `${socket.username} joined the chat.`,
            type: "system",
            timestamp: Date.now(),
        });
    });

    //For disconnection
    socket.on("disconnect", ()=>{
        console.log(`User disconnected:`, socket.io);
        users.delete(socket.username);
        io.emit("user list", Array.from(users));
        if (socket.username) {
            io.emit("chat message", {
                sender: "System",
                text: `${socket.username} left the chat.`,
                type: "system",
                timestamp: Date.now(),
            });
        }
    });
});

server.listen(3030, ()=>{
    console.log("Server is running on Port 3030");
});