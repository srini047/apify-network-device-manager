"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Terminal,
  Mic,
  MicOff,
  Send,
  Loader2,
  Volume2,
  Globe,
  Languages,
} from "lucide-react";
import { DefaultChatTransport } from "ai";

export function TerminalChat({ uri, context }: { uri: string; context: any }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [ttsLoading, setTtsLoading] = useState<string | null>(null);
  const [translationLoading, setTranslationLoading] = useState<string | null>(
    null
  );
  const [translatedMessages, setTranslatedMessages] = useState<
    Record<string, string>
  >({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { messages, input, setInput, handleSubmit, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/mongodb/query" }),
    body: { connectionString: uri, context },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        await handleSTT(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const handleSTT = async (blob: Blob) => {
    setRecordingLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("language_code", selectedLanguage);

      const response = await fetch("/api/ai/stt", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.transcript) {
        setInput(data.transcript);
      }
    } catch (err) {
      console.error("STT process error:", err);
    } finally {
      setRecordingLoading(false);
    }
  };

  const handleTranslate = async (messageId: string, text: string) => {
    if (selectedLanguage === "en-IN") return;

    setTranslationLoading(messageId);
    try {
      const locale = selectedLanguage.split("-")[0];
      const response = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLocale: locale }),
      });
      const data = await response.json();
      if (data.translatedText) {
        setTranslatedMessages((prev) => ({
          ...prev,
          [messageId]: data.translatedText,
        }));
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslationLoading(null);
    }
  };

  const handleTTS = async (messageId: string, text: string) => {
    setTtsLoading(messageId);
    try {
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: translatedMessages[messageId] || text,
          target_language_code: selectedLanguage,
        }),
      });
      const data = await response.json();
      if (data.audio_content) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio_content}`);
        audio.play();
      }
    } catch (err) {
      console.error("TTS error:", err);
    } finally {
      setTtsLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-sm shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-primary">
          <Terminal className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Command Center v1.0
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase">
            <Globe className="h-3 w-3" />
            <select
              className="bg-transparent border-none focus:ring-0 cursor-pointer hover:text-primary transition-colors"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="en-IN">English (IN)</option>
              <option value="hi-IN">Hindi</option>
              <option value="gu-IN">Gujarati</option>
              <option value="mr-IN">Marathi</option>
            </select>
          </div>
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-zinc-600 italic text-xs animate-pulse">
              {">"} Pipeline connected. Awaiting telemetry queries...
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg ${
                  m.role === "user"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-zinc-900 text-zinc-300 border border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase font-bold tracking-tighter">
                  <span>{m.role === "user" ? "ADMIN" : "AI_CORE"}</span>
                </div>
                <div className="text-xs leading-relaxed whitespace-pre-wrap">
                  {translatedMessages[m.id] || m.content}
                </div>
                {m.role === "assistant" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-500 hover:text-primary"
                      onClick={() => handleTTS(m.id, m.content)}
                      disabled={!!ttsLoading}
                    >
                      {ttsLoading === m.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </Button>
                    {selectedLanguage !== "en-IN" &&
                      !translatedMessages[m.id] && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-500 hover:text-accent"
                          onClick={() => handleTranslate(m.id, m.content)}
                          disabled={!!translationLoading}
                        >
                          {translationLoading === m.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Languages className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {status === "submitted" ||
            (status === "streaming" && (
              <div className="flex items-center gap-2 text-zinc-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-[10px] uppercase tracking-widest">
                  Processing Query...
                </span>
              </div>
            ))}
        </div>
      </ScrollArea>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || status !== "ready") return;
          handleSubmit(e);
        }}
        className="p-3 bg-zinc-950/50 border-t border-zinc-800 flex gap-2"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-9 w-9 rounded-full transition-colors ${
            isRecording
              ? "text-destructive bg-destructive/10 animate-pulse"
              : "text-zinc-500 hover:text-primary"
          }`}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          disabled={recordingLoading}
        >
          {recordingLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command or hold Mic for STT..."
          className="flex-1 bg-zinc-950 border-zinc-800 focus:border-primary/50 text-xs h-9"
          disabled={status !== "ready"}
        />
        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
          disabled={!input.trim() || status !== "ready"}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
