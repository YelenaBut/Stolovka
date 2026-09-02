"use client";

import { useRef, useState } from "react";

export default function Recorder() {
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const recorder = new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.start();

    setRecording(true);
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (!recorder) return;

    recorder.onstop = async () => {
  const audioBlob = new Blob(chunksRef.current, {
    type: "audio/webm",
  });

  console.log("Запись готова:", audioBlob);

  const file = new File(
    [audioBlob],
    "answer.webm",
    {
      type: "audio/webm",
    }
  );

  const formData = new FormData();
  formData.append("file", file);

  console.log("Отправляем запись на сервер...");

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  console.log("Ответ AI:", result);
};

    recorder.stop();
    setRecording(false);
  }

  return (
    <div className="mt-8 flex justify-center">
      {!recording ? (
        <button
          onClick={startRecording}
          className="rounded-full bg-red-500 px-8 py-4 text-lg font-semibold text-white hover:bg-red-600"
        >
          🎙️ Record
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="rounded-full bg-gray-800 px-8 py-4 text-lg font-semibold text-white"
        >
          ⏹ Stop
        </button>
      )}
    </div>
  );
}