'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/basic-data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type OptRow = {
  id: string;
  job_title: string;
  job_company: string | null;
  ats_score: number;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score < 50
      ? 'text-red-600 bg-red-50 border-red-200'
      : score < 75
        ? 'text-amber-600 bg-amber-50 border-amber-200'
        : 'text-green-600 bg-green-50 border-green-200';
  return (
    <span className={`inline-flex items-center text-sm font-semibold px-2.5 py-1 rounded-full border shadow-sm ${cls}`}>
      {score}
    </span>
  );
}

interface Props {
  optimizations: OptRow[];
}

export function DashboardClient({ optimizations: initial }: Props) {
  const [rows, setRows] = useState<OptRow[]>(initial);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/optimizations?id=${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.id !== deleteId));
      }
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  const columns = [
    {
      key: 'job_title' as const,
      header: 'Position',
      sortable: true,
      render: (val: string) => (
        <span className="font-medium text-gray-900">{val}</span>
      ),
    },
    {
      key: 'job_company' as const,
      header: 'Company',
      sortable: true,
      render: (val: string | null) => (
        <span className="text-sm text-gray-500">{val ?? ''}</span>
      ),
    },
    {
      key: 'ats_score' as const,
      header: 'ATS Score',
      sortable: true,
      render: (val: number) => <ScoreBadge score={val} />,
    },
    {
      key: 'created_at' as const,
      header: 'Date',
      sortable: true,
      render: (val: string) => (
        <span className="text-sm text-gray-500">{formatDate(val)}</span>
      ),
    },
    {
      key: 'id' as const,
      header: '',
      sortable: false,
      render: (_: string, row: OptRow) => (
        <div className="flex items-center gap-2 justify-end">
          <a
            href={`/api/download-pdf?id=${row.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E3A5F] border border-[#1E3A5F]/30 rounded-lg hover:bg-[#1E3A5F]/5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </a>
          <Link
            href={`/app/results/${row.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-[#1E3A5F] transition-colors"
          >
            View
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <button
            onClick={() => setDeleteId(row.id)}
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
            aria-label="Delete optimization"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  if (rows.length === 0) {
    return (
      <div className="relative bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-200/60 to-transparent" />
        <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F]/5 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#1E3A5F]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-700 text-lg font-semibold mb-1">No optimizations yet</p>
        <p className="text-gray-400 text-sm mb-6">Upload your resume and paste a job listing to get started.</p>
        <Link
          href="/app/upload"
          className="inline-flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-6 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
        >
          Optimize My Resume →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl shadow-sm">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-200/60 to-transparent z-10 pointer-events-none" />
        <DataTable
          data={rows}
          columns={columns}
          searchable
          searchPlaceholder="Search by position, company…"
          itemsPerPage={10}
          hoverable
        />
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Optimization</DialogTitle>
            <DialogDescription>
              This optimization record will be permanently deleted. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
