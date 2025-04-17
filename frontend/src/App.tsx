import { useState } from "react";

export default function App() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!resume || !jobDesc) return;

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobdesc", jobDesc);
    setLoading(true);
    setPdfUrl(null);

    try {
      const res = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setPdfUrl(data.pdfDownload); // e.g., "http://localhost:3001/download"
    } catch (err) {
      alert("❌ Failed to generate the study plan PDF.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center p-8 gap-8">
      <h1 className="text-4xl font-bold">📄 SkillSyncAI</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setResume(e.target.files?.[0] || null)}
        className="p-2 border rounded"
      />
      <input
        type="file"
        accept=".txt"
        onChange={(e) => setJobDesc(e.target.files?.[0] || null)}
        className="p-2 border rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Analyzing..." : "Generate Study Plan"}
      </button>

      {pdfUrl && (
        <a
          href={pdfUrl}
          download="SkillSyncAI_Study_Plan.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          🔽 Download PDF
        </a>
      )}
    </div>
  );
}