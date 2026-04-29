import type { OptimizedCv } from '@/types';

interface CvPreviewProps {
  cv: OptimizedCv;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-2 pb-1 border-b border-gray-200">
      {children}
    </h2>
  );
}

export function CvPreview({ cv }: CvPreviewProps) {
  const contactLinks = [
    cv.email,
    cv.phone,
    cv.location,
    cv.linkedin,
    cv.github,
    cv.website,
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 text-sm font-sans max-h-[72vh] overflow-y-auto space-y-5">
      {/* Header */}
      <div className="border-b-2 border-[#1E3A5F] pb-4">
        <h1 className="text-xl font-bold text-[#1E3A5F] leading-tight">{cv.name}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-gray-500 text-xs">
          {contactLinks.map((link, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300">·</span>}
              {link}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {cv.summary && (
        <section>
          <SectionTitle>Professional Summary</SectionTitle>
          <p className="text-gray-700 leading-relaxed text-xs">{cv.summary}</p>
        </section>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <section>
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-4">
            {cv.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-xs">{exp.title}</p>
                    <p className="text-gray-500 text-xs">{exp.company}</p>
                  </div>
                  <span className="text-gray-400 text-xs whitespace-nowrap">{exp.duration}</span>
                </div>
                <ul className="mt-1.5 space-y-1 pl-3">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="text-gray-700 leading-relaxed list-disc text-xs">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
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

      {/* Skills */}
      {cv.skills.length > 0 && (
        <section>
          <SectionTitle>Skills</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((skill, i) => (
              <span key={i} className="bg-blue-50 text-[#1E3A5F] text-xs px-2 py-0.5 rounded font-medium">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* References */}
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
