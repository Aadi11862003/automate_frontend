import React, { useState, useEffect } from "react";
import axios from "axios";

const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("Click mic and speak a command...");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    const recog = new window.webkitSpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";

    recog.onstart = () => setMessage("🎙️ Listening...");
    recog.onresult = async (event) => {
      const voiceCommand = event.results[0][0].transcript;
      setMessage(`You said: ${voiceCommand}`);
      setListening(false);
      await sendCommand(voiceCommand);
    };
    recog.onerror = (err) => {
      console.error(err);
      setMessage("❌ Error while listening.");
      setListening(false);
    };

    setRecognition(recog);
  }, []);

  const sendCommand = async (cmd) => {
    try {
      const res = await axios.post("http://localhost:5000/api/ai/command", {
        command: cmd,
      });
      const reply = res.data.reply;
      setMessage(reply);
      speak(reply);
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    synth.speak(utter);
  };

  const toggleListening = () => {
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#121212",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
        🎤 Voice AI Assistant
      </h1>
      <button
        onClick={toggleListening}
        style={{
          padding: "15px 30px",
          borderRadius: "10px",
          background: listening ? "#ff4d4d" : "#4CAF50",
          border: "none",
          color: "#fff",
          fontSize: "1.1rem",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        {listening ? "Stop Listening" : "Start Listening"}
      </button>
      <p style={{ maxWidth: "80%", textAlign: "center" }}>{message}</p>
    </div>
  );
};

export default VoiceAssistant;
