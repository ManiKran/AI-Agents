import React, { useState } from 'react';
import JSZip from 'jszip';

function FileUpload() {
  const [loading, setLoading] = useState(false);
  const [resourcesFile, setResourcesFile] = useState<Blob | null>(null);
  const [planFile, setPlanFile] = useState<Blob | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setLoading(true);
    const response = await fetch('http://localhost:3001/analyze', {
      method: 'POST',
      body: formData,
    });

    const blob = await response.blob();
    const zip = await JSZip.loadAsync(blob);
    const resources = await zip.file('learning-resources.json')?.async('blob');
    const plan = await zip.file('weekly-study-plan.json')?.async('blob');

    setResourcesFile(resources || null);
    setPlanFile(plan || null);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Upload Resume (PDF)</label>
        <input name="resume" type="file" accept=".pdf" required className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block font-medium">Upload Job Description (TXT)</label>
        <input name="jobdesc" type="file" accept=".txt" required className="w-full border p-2 rounded" />
      </div>
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {resourcesFile && (
        <div>
          <h2 className="font-semibold mt-4">Learning Resources</h2>
          <a
            href={URL.createObjectURL(resourcesFile)}
            download="learning-resources.json"
            className="text-blue-500 underline mr-4"
            target="_blank"
          >
            Preview / Download
          </a>
        </div>
      )}

      {planFile && (
        <div>
          <h2 className="font-semibold mt-4">Weekly Study Plan</h2>
          <a
            href={URL.createObjectURL(planFile)}
            download="weekly-study-plan.json"
            className="text-blue-500 underline"
            target="_blank"
          >
            Preview / Download
          </a>
        </div>
      )}
    </form>
  );
}

export default FileUpload;