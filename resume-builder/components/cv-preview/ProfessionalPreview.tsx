import type { OptimizedCv, CvSkills } from '@/types';

const SKILL_CATS: Array<{ key: keyof CvSkills; label: string }> = [
  { key: 'languages',     label: 'Languages' },
  { key: 'frameworks',    label: 'Frameworks' },
  { key: 'databases',     label: 'Databases' },
  { key: 'tools',         label: 'Tools' },
  { key: 'methodologies', label: 'Methodologies' },
];

const LORA: React.CSSProperties = {
  fontFamily: 'var(--font-lora), Georgia, "Times New Roman", serif',
};

function SectionTitle({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  return (
    <div
      className="text-[10.5px] font-bold uppercase tracking-wider text-gray-900 pb-1 mb-2.5"
      style={{ ...LORA, borderBottom: `1px solid ${accentColor}` }}
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
    <div className="bg-white p-7 text-[13px] text-gray-900 space-y-4 max-h-[72vh] overflow-y-auto" style={LORA}>

      {/* ── Header ── */}
      <div className="text-center">
        <h1 className="text-[22px] font-bold tracking-[0.06em] text-gray-900 mb-1" style={LORA}>
          {cv.name}
        </h1>
        {cv.job_title && (
          <p className="text-[12px] italic text-gray-500 mb-2" style={LORA}>
            {cv.job_title}
          </p>
        )}
        {contactParts.length > 0 && (
          <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
            {contactParts.join('   ·   ')}
          </p>
        )}
        <div className="w-full" style={{ borderBottom: '1px solid #111111' }} />
      </div>

      {/* ── Summary ── */}
      {cv.summary && (
        <div>
          <SectionTitle accentColor={accentColor}>Professional Summary</SectionTitle>
          <p className="text-[12px] text-gray-700 leading-relaxed" style={LORA}>
            {cv.summary}
          </p>
        </div>
      )}

      {/* ── Experience ── */}
      {cv.experience.length > 0 && (
        <div>
          <SectionTitle accentColor={accentColor}>Work Experience</SectionTitle>
          <div className="space-y-4">
            {cv.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-gray-900 text-[12.5px]" style={LORA}>
                    {exp.company}
                  </span>
                  <span className="text-[11px] text-gray-500">{exp.duration}</span>
                </div>
                <p className="italic text-[12px] text-gray-600 mb-1.5" style={LORA}>
                  {exp.title}
                </p>
                <ul className="space-y-0.5">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2 text-[11.5px] text-gray-700 leading-relaxed">
                      <span className="flex-shrink-0 mt-0.5 text-gray-500">•</span>
                      <span style={LORA}>{b}</span>
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
                  <span className="font-bold text-gray-900 text-[12.5px]" style={LORA}>
                    {edu.school}
                  </span>
                  <span className="text-[11px] text-gray-500">{edu.year}</span>
                </div>
                <p className="italic text-[12px] text-gray-600 mt-0.5" style={LORA}>
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
          <SectionTitle accentColor={accentColor}>Technical Skills</SectionTitle>
          {skillsIsArray ? (
            <p className="text-[12px] text-gray-700 leading-relaxed" style={LORA}>
              {(cv.skills as string[]).join(', ')}
            </p>
          ) : (
            <div className="space-y-1.5">
              {SKILL_CATS.map(({ key, label }) => {
                const arr = (cv.skills as CvSkills)[key] ?? [];
                if (arr.length === 0) return null;
                return (
                  <p key={key} className="text-[12px] text-gray-700 leading-relaxed" style={LORA}>
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
