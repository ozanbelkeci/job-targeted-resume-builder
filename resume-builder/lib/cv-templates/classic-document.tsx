import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { OptimizedCv, CvSkills } from '@/types';

const SKILL_CATS: Array<{ key: keyof CvSkills; label: string }> = [
  { key: 'languages',    label: 'Languages' },
  { key: 'frameworks',   label: 'Frameworks' },
  { key: 'databases',    label: 'Databases' },
  { key: 'tools',        label: 'Tools' },
  { key: 'methodologies',label: 'Methodologies' },
];

function buildStyles(accentColor: string) {
  return StyleSheet.create({
    page: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: 10,
      color: '#1a1a1a',
      paddingTop: 56,
      paddingBottom: 56,
      paddingLeft: 64,
      paddingRight: 64,
    },
    headerName: {
      fontSize: 22,
      fontWeight: 700,
      color: accentColor,
      textAlign: 'center',
      letterSpacing: 1,
      marginBottom: 3,
    },
    headerJobTitle: {
      fontSize: 11,
      fontWeight: 400,
      color: '#4b5563',
      textAlign: 'center',
      marginBottom: 5,
    },
    headerContactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 2,
    },
    headerContact: {
      fontSize: 9,
      color: '#6b7280',
      marginRight: 10,
      marginBottom: 2,
    },
    divider: {
      borderBottomWidth: 1.5,
      borderBottomColor: accentColor,
      marginTop: 10,
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 8.5,
      fontWeight: 700,
      color: accentColor,
      textTransform: 'uppercase',
      letterSpacing: 1.6,
      marginBottom: 4,
      paddingBottom: 3,
      borderBottomWidth: 1.5,
      borderBottomColor: accentColor,
    },
    section: {
      marginBottom: 16,
    },
    summary: {
      fontSize: 9.5,
      color: '#374151',
      lineHeight: 1.65,
    },
    expRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 1,
    },
    expTitle: {
      fontWeight: 700,
      fontSize: 10.5,
      color: '#111827',
    },
    expCompany: {
      fontSize: 9,
      color: '#6b7280',
      marginBottom: 5,
    },
    expDuration: {
      fontSize: 9,
      color: '#9ca3af',
    },
    expBlock: {
      marginBottom: 12,
    },
    bullet: {
      flexDirection: 'row',
      marginBottom: 3,
      paddingLeft: 6,
    },
    bulletDot: {
      width: 10,
      color: accentColor,
      fontSize: 9,
      marginTop: 1,
    },
    bulletText: {
      flex: 1,
      fontSize: 9.5,
      color: '#374151',
      lineHeight: 1.55,
    },
    skillsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    skillCatRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      marginBottom: 5,
    },
    skillCatLabel: {
      fontSize: 8.5,
      fontWeight: 700,
      color: '#374151',
      width: 80,
      paddingTop: 2.5,
      marginRight: 4,
    },
    skillCatBadges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1,
    },
    skillBadge: {
      fontSize: 8.5,
      color: accentColor,
      backgroundColor: '#f1f5f9',
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      borderRadius: 3,
      marginRight: 5,
      marginBottom: 5,
    },
    eduRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    eduDegree: {
      fontWeight: 700,
      fontSize: 10,
      color: '#111827',
    },
    eduSchool: {
      fontSize: 9,
      color: '#6b7280',
      marginTop: 1,
    },
    eduYear: {
      fontSize: 9,
      color: '#9ca3af',
    },
    refRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    refName: {
      fontWeight: 700,
      fontSize: 10,
      color: '#111827',
    },
    refTitle: {
      fontSize: 9,
      color: '#6b7280',
      marginTop: 1,
    },
    refContact: {
      fontSize: 9,
      color: '#9ca3af',
    },
  });
}

export function ClassicDocument({ cv, accentColor }: { cv: OptimizedCv; accentColor: string }) {
  const s = buildStyles(accentColor);
  const contactParts = [cv.email, cv.phone, cv.location, cv.linkedin, cv.github, cv.website, cv.portfolio].filter(Boolean) as string[];
  const skillsIsArray = Array.isArray(cv.skills);
  const hasSkills = skillsIsArray
    ? (cv.skills as string[]).length > 0
    : SKILL_CATS.some(({ key }) => ((cv.skills as CvSkills)[key] ?? []).length > 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <Text style={s.headerName}>{cv.name}</Text>
        {cv.job_title ? <Text style={s.headerJobTitle}>{cv.job_title}</Text> : null}
        <View style={s.headerContactRow}>
          {contactParts.map((part, i) => (
            <Text key={i} style={s.headerContact}>{i > 0 ? '· ' : ''}{part}</Text>
          ))}
        </View>
        <View style={s.divider} />

        {/* Summary */}
        {cv.summary ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Professional Summary</Text>
            <Text style={s.summary}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* Experience — each entry rendered as a flat Page-level sibling so @react-pdf
            can paginate them independently instead of treating the whole section as one block */}
        {cv.experience.map((exp, i) => (
          <View key={i} style={i === cv.experience.length - 1 ? [s.expBlock, { marginBottom: 16 }] : s.expBlock}>
            {i === 0 ? <Text style={s.sectionTitle}>Experience</Text> : null}
            <View style={s.expRow}>
              <Text style={s.expTitle}>{exp.title}</Text>
              <Text style={s.expDuration}>{exp.duration}</Text>
            </View>
            <Text style={s.expCompany}>{exp.company}</Text>
            {(exp.bullets ?? []).map((bullet, j) => (
              <View key={j} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Education */}
        {cv.education.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Education</Text>
            {cv.education.map((edu, i) => (
              <View key={i} style={s.eduRow}>
                <View>
                  <Text style={s.eduDegree}>{edu.degree}</Text>
                  <Text style={s.eduSchool}>{edu.school}</Text>
                </View>
                <Text style={s.eduYear}>{edu.year}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {hasSkills ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Skills</Text>
            {skillsIsArray ? (
              <View style={s.skillsWrap}>
                {(cv.skills as string[]).map((skill, i) => (
                  <Text key={i} style={s.skillBadge}>{skill}</Text>
                ))}
              </View>
            ) : (
              <View>
                {SKILL_CATS.map(({ key, label }) => {
                  const arr = (cv.skills as CvSkills)[key] ?? [];
                  if (arr.length === 0) return null;
                  return (
                    <View key={key} style={s.skillCatRow}>
                      <Text style={s.skillCatLabel}>{label}</Text>
                      <View style={s.skillCatBadges}>
                        {arr.map((skill, i) => (
                          <Text key={i} style={s.skillBadge}>{skill}</Text>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        {/* References */}
        {cv.references && cv.references.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>References</Text>
            {cv.references.map((ref, i) => (
              <View key={i} style={s.refRow}>
                <View>
                  <Text style={s.refName}>{ref.name}</Text>
                  <Text style={s.refTitle}>{ref.title}</Text>
                </View>
                <Text style={s.refContact}>{ref.contact}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
