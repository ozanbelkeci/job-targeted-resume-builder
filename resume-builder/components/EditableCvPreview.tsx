'use client';

import type { OptimizedCv, CvSkills } from '@/types';
import { SummaryEditor } from '@/components/editing/SummaryEditor';
import { SkillsEditor } from '@/components/editing/SkillsEditor';
import { BulletsEditor } from '@/components/editing/BulletsEditor';

interface EditableCvPreviewProps {
  cv: OptimizedCv;
  onChange: (updated: OptimizedCv, immediate?: boolean) => void;
  editingExperienceIdx: number | null;
  onSetEditingExperience: (idx: number | null) => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-2 pb-1 border-b border-gray-200">
      {children}
    </h2>
  );
}

export function EditableCvPreview({
  cv,
  onChange,
  editingExperienceIdx,
  onSetEditingExperience,
}: EditableCvPreviewProps) {
  const contactLinks = [
    cv.email,
    cv.phone,
    cv.location,
    cv.linkedin,
    cv.github,
    cv.website,
    cv.portfolio,
  ].filter(Boolean);

  const skillsIsArray = Array.isArray(cv.skills);
  const hasSkills = skillsIsArray
    ? (cv.skills as string[]).length > 0
    : Object.values(cv.skills as CvSkills).some((a) => a.length > 0);

  function handleSummaryChange(v: string) {
    onChange({ ...cv, summary: v });
  }

  function handleSkillsChange(skills: CvSkills | string[], immediate: boolean) {
    onChange({ ...cv, skills }, immediate);
  }

  function handleBulletsChange(idx: number, bullets: string[]) {
    const updatedExp = cv.experience.map((exp, i) =>
      i === idx ? { ...exp, bullets } : exp,
    );
    onChange({ ...cv, experience: updatedExp });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 text-sm font-sans max-h-[72vh] overflow-y-auto space-y-5">
      {/* Header — non-editable */}
      <div className="border-b-2 border-[#1E3A5F] pb-4">
        <h1 className="text-xl font-bold text-[#1E3A5F] leading-tight">{cv.name}</h1>
        {cv.job_title && <p className="text-sm text-gray-500 font-medium mt-0.5">{cv.job_title}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-gray-500 text-xs">
          {contactLinks.map((link, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300">·</span>}
              {link}
            </span>
          ))}
        </div>
      </div>

      {/* Summary — editable */}
      {cv.summary && (
        <section>
          <SectionTitle>Professional Summary</SectionTitle>
          <SummaryEditor
            value={cv.summary}
            onChange={handleSummaryChange}
          />
        </section>
      )}

      {/* Experience — bullets editable */}
      {cv.experience.length > 0 && (
        <section>
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-4">
            {cv.experience.map((exp, i) => {
              const isActive = editingExperienceIdx === i;
              const isOther = editingExperienceIdx !== null && !isActive;
              return (
                <div
                  key={exp.id ?? i}
                  className={`transition-all duration-200 rounded-lg p-1.5 -mx-1.5 ${
                    isActive
                      ? 'ring-2 ring-[#1E3A5F]/25 bg-blue-50/20'
                      : isOther
                      ? 'opacity-60'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div>
                      <p className="font-semibold text-gray-900 text-xs">{exp.title}</p>
                      <p className="text-gray-500 text-xs">{exp.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs whitespace-nowrap">{exp.duration}</span>
                      {!isActive && (
                        <button
                          onClick={() => onSetEditingExperience(i)}
                          className="text-xs text-[#1E3A5F] hover:text-[#162d4a] border border-[#1E3A5F]/30 rounded px-1.5 py-0.5 hover:bg-[#1E3A5F]/5 transition-colors whitespace-nowrap"
                        >
                          Edit bullets
                        </button>
                      )}
                    </div>
                  </div>

                  {isActive ? (
                    <BulletsEditor
                      bullets={exp.bullets}
                      onChange={(b) => handleBulletsChange(i, b)}
                      onDone={() => onSetEditingExperience(null)}
                    />
                  ) : (
                    <ul className="mt-1 space-y-1 pl-3">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j} className="text-gray-700 leading-relaxed list-disc text-xs">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Education — non-editable */}
      {cv.education.length > 0 && (
        <section>
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-2">
            {cv.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-xs">{edu.degree}</p>
                  <p className="text-gray-500 text-xs">{edu.school}</p>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills — editable */}
      {hasSkills && (
        <section>
          <SectionTitle>Skills</SectionTitle>
          <SkillsEditor
            skills={cv.skills}
            onChange={handleSkillsChange}
          />
        </section>
      )}

      {/* References — non-editable, backward compat */}
      {cv.references && cv.references.length > 0 && (
        <section>
          <SectionTitle>References</SectionTitle>
          <div className="space-y-2">
            {cv.references.map((ref, i) => (
              <div key={i} className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-xs">{ref.name}</p>
                  <p className="text-gray-500 text-xs">{ref.title}</p>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap">{ref.contact}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
