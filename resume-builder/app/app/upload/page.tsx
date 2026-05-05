'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/FileUploader';
import type { Resume } from '@/types';

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Upload Resume' },
    { n: 2, label: 'Job Details' },
    { n: 3, label: 'Results' },
  ];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                    : active
                      ? 'bg-[#1E3A5F] text-white shadow-sm shadow-[#1E3A5F]/30'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.n
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  active ? 'text-[#1E3A5F]' : done ? 'text-gray-400' : 'text-gray-300'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-3 h-px w-8 transition-colors ${done ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden bg-gradient-to-b from-[#F0F4F8] via-white to-white">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(at 50% 0%, rgba(30,58,95,0.06) 0%, transparent 60%)' }}
      />
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-xl">
        <StepIndicator current={1} />

        <div className="relative bg-white rounded-2xl border border-gray-200/80 p-8 shadow-lg glow-ring-navy overflow-hidden">
          {/* Top gradient accent */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />

          {isLoadingResumes ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/5 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-[#1E3A5F]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Loading your resumes…</p>
            </div>
          ) : resumes.length > 0 && !showUploadForm ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1">Your Saved Resumes</h1>
                <p className="text-gray-400 text-sm">Select a resume to use, or upload a new one.</p>
              </div>

              <div className="space-y-2.5 mb-6">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-[#1E3A5F]/50 hover:bg-blue-50/20 transition-all duration-150 card-hover-lift"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#1E3A5F]/8 border border-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1E3A5F]/12 transition-colors">
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
                        className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white text-xs px-3.5 py-1.5 h-auto rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
                        Use This CV
                      </Button>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        disabled={deletingId === resume.id}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-40"
                        aria-label="Delete resume"
                      >
                        {deletingId === resume.id ? (
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowUploadForm(true)}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3.5 text-sm text-gray-400 hover:border-[#1E3A5F]/40 hover:text-[#1E3A5F] hover:bg-blue-50/20 transition-all font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload New CV
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1">
                {resumes.length > 0 && (
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Back"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h1 className="text-2xl font-bold text-[#1E3A5F]">Upload Your Resume</h1>
              </div>
              <p className="text-gray-400 text-sm mb-6 ml-0">
                PDF format only. Your file stays private — we only store the text content.
              </p>

              <FileUploader onFileSelect={setSelectedFile} selectedFile={selectedFile} />

              {selectedFile && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name this CV profile{' '}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={selectedFile.name.replace(/\.pdf$/i, '')}
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                  />
                </div>
              )}

              {error && (
                <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="mt-6 w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-xl py-5 text-base font-semibold disabled:opacity-40 shadow-md shadow-[#1E3A5F]/20 hover:shadow-lg hover:shadow-[#1E3A5F]/25 transition-all hover:-translate-y-px"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing…
                  </span>
                ) : (
                  'Save & Continue →'
                )}
              </Button>
            </>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your resume is never shared. Only extracted text is stored.
        </p>
      </div>
    </div>
  );
}
