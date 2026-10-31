import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { FileAudio, Upload as UploadIcon, X } from "lucide-react";
import api from "../api";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";

const MAX_SIZE = 100 * 1024 * 1024;
const AUDIO_PATTERN = /\.(mp3|wav|m4a|aac|ogg|oga|flac|webm)$/i;

const formatSize = (bytes) =>
  bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const NEXT_STEPS = [
  "Your recording is uploaded to ScribWave.",
  "ScribWave writes the transcript and labels each speaker.",
  "You get a summary and the action items, usually in a minute or two.",
];

function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const chooseFile = (chosen) => {
    if (!chosen) return;

    const looksLikeAudio =
      chosen.type.startsWith("audio/") || AUDIO_PATTERN.test(chosen.name);
    if (!looksLikeAudio) {
      setError("Please choose an audio file (mp3, wav, m4a and similar).");
      return;
    }
    if (chosen.size > MAX_SIZE) {
      setError("This file is larger than 100 MB.");
      return;
    }

    setError("");
    setFile(chosen);
    // Suggest a title from the file name if none was typed
    if (!title.trim()) {
      setTitle(chosen.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please choose or drop an audio file first.");
      return;
    }

    // Text fields go before the file; the file field must be called "audio"
    const formData = new FormData();
    formData.append("title", title.trim() || file.name);
    formData.append("audio", file);

    try {
      setUploading(true);
      setError("");
      setProgress(0);

      const response = await api.post("/api/meetings/upload", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      toast.success("Uploaded. ScribWave is working on it.");
      navigate(`/app/meetings/${response.data.meeting._id}`);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Upload failed. The server may be waking up, so please try again in a minute."
      );
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl">New meeting</h1>
      <p className="mt-1 text-muted">
        Upload a recording and ScribWave will do the rest.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-sm"
        >
          <TextField
            id="title"
            label="Meeting title"
            placeholder="e.g. Weekly project review"
            value={title}
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
          />

          <div>
            <p className="mb-1.5 text-sm font-semibold">Recording</p>
            <div
              role="button"
              tabIndex={0}
              onClick={() => !uploading && inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (!uploading) inputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (!uploading) chooseFile(event.dataTransfer.files[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                dragging
                  ? "border-brand-text bg-brand-text/10"
                  : "border-line hover:border-brand-text/60 hover:bg-surface-2"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(event) => chooseFile(event.target.files[0])}
              />

              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex w-full max-w-md items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                      <FileAudio size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{file.name}</p>
                      <p className="text-xs text-muted">{formatSize(file.size)}</p>
                    </div>
                    {!uploading && (
                      <button
                        type="button"
                        aria-label="Remove file"
                        onClick={(event) => {
                          event.stopPropagation();
                          setFile(null);
                        }}
                        className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={dragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-text/10 text-brand-text"
                    >
                      <UploadIcon size={28} />
                    </motion.div>
                    <p className="font-display text-lg font-bold">
                      {dragging ? "Drop it here" : "Drag and drop your recording"}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      or click to browse. mp3, wav, m4a and more, up to 100 MB.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {uploading && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className="h-full rounded-full bg-brand"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {progress < 100
                  ? `Uploading your recording… ${progress}%`
                  : "Upload complete. Starting the analysis…"}
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          )}

          <Button type="submit" disabled={uploading} className="w-full py-3">
            {uploading ? "Uploading…" : "Upload and analyze"}
          </Button>
        </form>

        <aside className="rounded-2xl bg-[#0b1f4b] bg-[radial-gradient(circle_at_top_right,#1d4ed8,transparent_65%)] p-6 text-white">
          <h2 className="m-0 text-lg">What happens next</h2>
          <ol className="mt-5 space-y-5">
            {NEXT_STEPS.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-sm font-bold text-[#0b1f4b]">
                  {index + 1}
                </span>
                <p className="text-sm text-blue-50">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm">
            <p className="font-semibold">Tips for the best results</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-blue-100/90">
              <li>Use clear audio with little background noise.</li>
              <li>Say people's names aloud (for example, Thanks Priya) so ScribWave can label speakers.</li>
              <li>Mention deadlines out loud, like by Friday.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Upload;