'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [framework, setFramework] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFrameworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFramework(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !framework) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('framework', framework);

    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch');
      }

      const data = await res.json();
      setResponse(data.text);
      setError(null);
    } catch (error) {
      console.error(error);
      setError(error.message);
      setResponse('');
    }
  };

  return (
    <div className="container min-h-screen mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Convert your Design into Front-End Code easily</h1>
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <div>
          <label className="block mb-2">Upload Photos</label>
          <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="block w-full" />
        </div>
        <div>
          <label className="block mb-2">Choose your framework</label>
          <select onChange={handleFrameworkChange} className="block w-full">
            <option value="">Select Framework</option>
            <option value="Next.js">Next.js</option>
            <option value="React">React</option>
            <option value="Vue">Vue</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Done</button>
      </form>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}
      {response && (
        <div className="mt-4 p-4 bg-gray-100">
          <h2 className="text-xl font-bold mb-2">Generated Code</h2>
          <pre className="whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </div>
  );
}