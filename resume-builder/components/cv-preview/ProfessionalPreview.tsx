import type { OptimizedCv, CvSkills } from '@/types';

const SKILL_CATS: Array<{ key: keyof CvSkills; label: string }> = [
  { key: 'languages',     label: 'Languages' },
  { key: 'frameworks',    label: 'Frameworks' },
  { key: 'databases',     label: 'Databases' },
  { key: 'tools',         label: 'Tools' },
  { key: 'methodologies', label: 'Methodologies' },
];

const SERIF: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
};

function SectionTitle({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  return (
    <div
      className="text-[11px] font-bold uppercase tracking-wider text-gray-900 pb-1.5 mb-2.5"
      style={{ borderBottom: `1.5px solid ${accentColor}` }}
    >
      {children}
    </div>
  );
}

interface ProfessionalPreviewProps {
  cv: OptimizedCv;
  accentColor: string;
}

export function ProfessionalPreview({ cv, accentColor }: ProfessionalPreviewProps) {
  const skillsIsArray = Array.isArray(cv.skills);
  const hasSkills = skillsIsArray
    ? (cv.skills as string[]).length > 0
    : SKILL_CATS.some(({ key }) => ((cv.skills as CvSkills)[key] ?? []).length > 0);

  const contactParts = [cv.email, cv.phone, cv.location, cv.linkedin, cv.github, cv.portfolio, cv.website]
    .filter(Boolean) as string[];

  return (
    <div className="bg-white p-7 text-[13px] text-gray-900 space-y-5 max-h-[72vh] overflow-y-auto" style={SERIF}>

      {/* ── Header ── */}
      <div className="text-center mb-1">
        <h1
          className="text-2xl font-bold uppercase tracking-[0.18em] text-gray-900 mb-1"
          style={SERIF}
        >
          {cv.name}
        </h1>
        {cv.job_title && (
          <p className="text-sm italic text-gray-500 mb-2" style={SERIF}>
            {cv.job_title}
          </p>
        )}
        <div
          className="w-full mb-2"
          style={{ borderBottom: `1.5px solid ${accentColor}`, marginTop: 4, marginBottom: 6 }}
        />
        {contactParts.length > 0 && (
          <p className="text-xs text-gray-700 tracking-wide">
            {contactParts.join(' | ')}
          </p>
        )}
      </div>

      {/* ── Summary ── */}
      {cv.summary && (
        <div>
          <SectionTitle accentColor={accentColor}>Summary</SectionTitle>
          <p className="text-[12px] text-gray-700 leading-relaxed" style={SERIF}>
            {cv.summary}
          </p>
        </div>
      )}

      {/* ── Experience ── */}
      {cv.experience.length > 0 && (
        <div>
          <SectionTitle accentColor={accentColor}>Experience</SectionTitle>
          <div className="space-y-4">
            {cv.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-gray-900 text-[12.5px]" style={SERIF}>
                    {exp.company}
                  </span>
                  <span className="text-[11px] text-gray-500">{exp.duration}</span>
                </div>
                <p className="italic text-[12px] text-gray-600 mb-1.5" style={SERIF}>
                  {exp.title}
                </p>
                <ul className="space-y-0.5">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2 text-[11.5px] text-gray-700 leading-relaxed">
                      <span className="flex-shrink-0 mt-0.5">•</span>
                      <span style={SERIF}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Education ── */}
      {cv.education.length > 0 && (
        <div>
          <SectionTitle accentColor={accentColor}>Education</SectionTitle>
          <div className="space-y-3">
            {cv.education.map((edu, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-gray-900 text-[12.5px]" style={SERIF}>
                    {edu.school}
                  </span>
                  <span className="text-[11px] text-gray-500">{edu.year}</span>
                </div>
                <p className="italic text-[12px] text-gray-600 mt-0.5" style={SERIF}>
                  {edu.degree}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Skills ── */}
      {hasSkills && (
        <div>
          <SectionTitle accentColor={accentColor}>Skills</SectionTitle>
          {skillsIsArray ? (
            <p className="text-[12px] text-gray-700 leading-relaxed" style={SERIF}>
              {(cv.skills as string[]).join(', ')}
            </p>
          ) : (
            <div className="space-y-1.5">
              {SKILL_CATS.map(({ key, label }) => {
                const arr = (cv.skills as CvSkills)[key] ?? [];
                if (arr.length === 0) return null;
                return (
                  <p key={key} className="text-[12px] text-gray-700 leading-relaxed" style={SERIF}>
                    <strong className="font-bold text-gray-900">{label}: </strong>
                    {arr.join(', ')}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
