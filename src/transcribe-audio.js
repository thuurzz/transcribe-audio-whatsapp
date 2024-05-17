import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import { PassThrough } from "stream";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error(
    "OPENAI_API_KEY is not defined in the environment variables."
  );
}

const transcribeAudio = async (audioData) => {
  const formData = new FormData();
  const stream = new PassThrough();
  stream.end(audioData);

  formData.append("file", stream, {
    filename: "audio-file.wav",
    contentType: "audio/wav",
  });
  formData.append("model", "whisper-1");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    return response.data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
};

export default transcribeAudio;
