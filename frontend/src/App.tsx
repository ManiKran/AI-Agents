import { useState, useEffect } from "react";

export default function App() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resourcesFile, setResourcesFile] = useState<Blob | null>(null);
  const [planFile, setPlanFile] = useState<Blob | null>(null);
  const [parsedResources, setParsedResources] = useState<any>(null);
  const [parsedPlan, setParsedPlan] = useState<any>(null);

  useEffect(() => {
    const parseFiles = async () => {
      if (resourcesFile) {
        const text = await resourcesFile.text();
        setParsedResources(JSON.parse(text));
      }
      if (planFile) {
        const text = await planFile.text();
        setParsedPlan(JSON.parse(text));
      }
    };
    parseFiles();
  }, [resourcesFile, planFile]);

  const handleSubmit = async () => {
    if (!resume || !jobDesc) return;

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobdesc", jobDesc);
    setLoading(true);

    const res = await fetch("http://localhost:3001/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    const blobResources = new Blob(
      [JSON.stringify(data.learningResources, null, 2)],
      { type: "application/json" }
    );
    const blobPlan = new Blob(
      [JSON.stringify(data.weeklyPlan, null, 2)],
      { type: "application/json" }
    );

    setResourcesFile(blobResources);
    setPlanFile(blobPlan);
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

      {resourcesFile && (
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-2">📘 Learning Resources</h2>
          <a
            href={URL.createObjectURL(resourcesFile)}
            download="learning-resources.json"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline block mb-2"
          >
            🔽 Download
          </a>
          <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto text-sm">
            {JSON.stringify(parsedResources, null, 2)}
          </pre>
        </div>
      )}

      {planFile && (
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-2">🗓️ Weekly Study Plan</h2>
          <a
            href={URL.createObjectURL(planFile)}
            download="weekly-study-plan.json"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline block mb-2"
          >
            🔽 Download
          </a>
          <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto text-sm">
            {JSON.stringify(parsedPlan, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}