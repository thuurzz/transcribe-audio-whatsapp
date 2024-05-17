import WhatsAppWeb from "whatsapp-web.js";
const { Client, LocalAuth } = WhatsAppWeb;
import qrcode from "qrcode-terminal";
import transcribeAudio from "./transcribe-audio.js";

// Create a new client instance
const client = new Client({
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
  authStrategy: new LocalAuth(), // => these saves your session locally
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Client is ready! Now I can listen your messages!");
});

// When the client received QR-Code
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Insert here the list of contacts if you want make the transcription restricted
const list_of_contacts = []; //`551190000000@c.us`

// Listening to all incoming messages
client.on("message_create", async (message) => {
  if (list_of_contacts.includes(message.from)) { //
    const typesMediaAccepted = ["ptt", "audio"];
    if (message.hasMedia && typesMediaAccepted.includes(message.type)) {
      const contato = await message.getContact();
      console.log(`Transcrevendo mensagem de: ${contato.name}`);
      const media = await message.downloadMedia();
      const audioData = Buffer.from(media.data, "base64");
      try {
        const transcription = await transcribeAudio(audioData);
        const messageFormatted = `Transcrição do audio: ${transcription}`;
        console.log(`Mensagem de: ${contato.name} transcrita com sucesso!`);
        message.reply(messageFormatted);
      } catch (error) {
        console.log("Error message" + error);
        client.sendMessage(
          message.from,
          "Desculpe, ocorreu um problema ao transcrever o audio."
        );
      }
    }
  }
});

// Start your client
client.initialize();
