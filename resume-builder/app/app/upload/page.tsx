'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/FileUploader';
import type { Resume } from '@/types';

export default function UploadPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cvName, setCvName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/resumes')
      .then((r) => r.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setResumes(data.data as Resume[]);
        } else {
          setShowUploadForm(true);
        }
      })
      .catch(() => setShowUploadForm(true))
      .finally(() => setIsLoadingResumes(false));
  }, []);

  function selectResume(resumeId: string) {
    sessionStorage.setItem('resumeId', resumeId);
    router.push('/app/job');
  }

  async function handleDelete(resumeId: string) {
    setDeletingId(resumeId);
    try {
      await fetch(`/api/resumes?id=${resumeId}`, { method: 'DELETE' });
      const updated = resumes.filter((r) => r.id !== resumeId);
      setResumes(updated);
      if (updated.length === 0) setShowUploadForm(true);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (cvName.trim()) formData.append('name', cvName.trim());

      const response = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to process PDF');
      }

      sessionStorage.setItem('resumeId', result.data.resumeId);
      router.push('/app/job');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't read your PDF. Please make sure it's a text-based PDF, not a scanned image.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-400">
          <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white text-xs flex items-center justify-center font-bold">1</span>
          <span className="text-[#1E3A5F] font-medium">Upload Resume</span>
          <span className="mx-2">→</span>
          <span className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center font-bold">2</span>
          <span>Job Details</span>
          <span className="mx-2">→</span>
          <span className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center font-bold">3</span>
          <span>Results</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {isLoadingResumes ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-6 w-6 text-[#1E3A5F]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          ) : resumes.length > 0 && !showUploadForm ? (
            <>
              <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">Your Saved Resumes</h1>
              <p className="text-gray-500 text-sm mb-6">Select a resume to use, or upload a new one.</p>

              <div className="space-y-3 mb-6">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-[#1E3A5F] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#1E3A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {resume.name ?? resume.original_filename}
                        </p>
                        <p className="text-xs text-gray-400">{formatDate(resume.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <Button
                        onClick={() => selectResume(resume.id)}
                        className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white text-xs px-3 py-1.5 h-auto rounded-lg"
                      >
                        Use This CV
                      </Button>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        disabled={deletingId === resume.id}
                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40 p-1"
                        aria-label="Delete resume"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowUploadForm(true)}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors font-medium"
              >
                + Upload New CV
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                {resumes.length > 0 && (
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Back"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h1 className="text-2xl font-bold text-[#1E3A5F]">Upload Your Resume</h1>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                PDF format only. Your file stays private — we only store the text content.
              </p>

              <FileUploader onFileSelect={setSelectedFile} selectedFile={selectedFile} />

              {selectedFile && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name this CV profile <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={selectedFile.name.replace(/\.pdf$/i, '')}
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
                  />
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="mt-6 w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg py-5 text-base font-medium disabled:opacity-40"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Save & Continue →'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
