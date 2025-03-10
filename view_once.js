 
/**
 * View-Once Media Converter Bot
 * Converts normal media to View-Once and vice versa when tagged with "vv".
 * 
 * Author: MuzyBaba
 * Copyright © 2025 MuzyBaba. All rights reserved.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

const makeWASocket = require("@whiskeysockets/baileys").default;
const { Boom } = require("@hapi/boom");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Pairing Code Authentication
async function startBot() {
    const sock = makeWASocket({ auth: {}, printQRInTerminal: true });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log("Scan this QR code to pair:");
            console.log(qr);
        }
        if (connection === "open") {
            console.log("Bot connected!");
        }
        if (connection === "close") {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
            console.log("Disconnected. Reconnecting:", shouldReconnect);
            if (shouldReconnect) startBot();
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || !msg.key.remoteJid) return;
        
        const from = msg.key.remoteJid;
        const isTagged = msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo;
        const text = msg.message.conversation  msg.message.extendedTextMessage?.text  "";

        if (isTagged && text.includes("vv")) {
            const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            if (!quotedMsg) return;

            // Convert View-Once to Normal
            if (quotedMsg.viewOnceMessage) {
                const mediaMsg = quotedMsg.viewOnceMessage.message;
                await sock.sendMessage(from, { text: "🔓 Converting View-Once to Normal..." });
                await sock.sendMessage(from, mediaMsg);
            } 
            // Convert Normal to View-Once
            else {
                await sock.sendMessage(from, { text: "🔒 Converting to View-Once..." });
                await sock.sendMessage(from, { viewOnce: true, message: quotedMsg });
            }
        }
    });
}

rl.question("Enter your pairing code: ", (code) => {
    console.log(Pairing with code: ${code});
    startBot();
});
