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
      paddingTop: 60,
      paddingBottom: 60,
      paddingLeft: 72,
      paddingRight: 72,
    },
    headerName: {
      fontSize: 26,
      fontWeight: 300,
      color: '#111111',
      letterSpacing: 2,
      marginBottom: 4,
    },
    headerJobTitle: {
      fontSize: 10,
      fontWeight: 400,
      color: '#6b7280',
      letterSpacing: 1,
      marginBottom: 8,
    },
    headerContactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 2,
    },
    headerContact: {
      fontSize: 8.5,
      color: '#9ca3af',
      marginRight: 14,
      marginBottom: 2,
    },
    divider: {
      borderBottomWidth: 0.5,
      borderBottomColor: '#e5e7eb',
      marginTop: 14,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 7.5,
      fontWeight: 400,
      color: accentColor,
      textTransform: 'uppercase',
      letterSpacing: 2.5,
      marginBottom: 10,
      opacity: 0.6,
    },
    section: {
      marginBottom: 22,
    },
    summary: {
      fontSize: 9.5,
      color: '#374151',
      lineHeight: 1.7,
    },
    expRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 1,
    },
    expTitle: {
      fontWeight: 700,
      fontSize: 10,
      color: '#111827',
    },
    expCompany: {
      fontSize: 9,
      color: '#6b7280',
      marginBottom: 6,
    },
    expDuration: {
      fontSize: 8.5,
      color: '#9ca3af',
    },
    expBlock: {
      marginBottom: 14,
    },
    bullet: {
      flexDirection: 'row',
      marginBottom: 3,
      paddingLeft: 8,
    },
    bulletDot: {
      width: 12,
      color: '#9ca3af',
      fontSize: 9,
      marginTop: 1,
    },
    bulletText: {
      flex: 1,
      fontSize: 9.5,
      color: '#374151',
      lineHeight: 1.6,
    },
    skillsText: {
      fontSize: 9.5,
      color: '#374151',
      lineHeight: 1.6,
    },
    skillCatRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    skillCatLabel: {
      fontSize: 8.5,
      fontWeight: 700,
      color: '#6b7280',
      width: 80,
      paddingTop: 1,
    },
    skillCatText: {
      flex: 1,
      fontSize: 9,
      color: '#374151',
      lineHeight: 1.5,
    },
    eduRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
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
      marginBottom: 10,
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

function skillsToText(skills: OptimizedCv['skills']): string {
  if (Array.isArray(skills)) return (skills as string[]).join(', ');
  const cats = skills as CvSkills;
  return SKILL_CATS.flatMap(({ key }) => cats[key] ?? []).join(', ');
}

export function MinimalDocument({ cv, accentColor }: { cv: OptimizedCv; accentColor: string }) {
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
            <Text style={s.sectionTitle}>Summary</Text>
            <Text style={s.summary}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {cv.experience.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Experience</Text>
            {cv.experience.map((exp, i) => (
              <View key={i} style={s.expBlock}>
                <View style={s.expRow}>
                  <Text style={s.expTitle}>{exp.title}</Text>
                  <Text style={s.expDuration}>{exp.duration}</Text>
                </View>
                <Text style={s.expCompany}>{exp.company}</Text>
                {exp.bullets.map((bullet, j) => (
                  <View key={j} style={s.bullet}>
                    <Text style={s.bulletDot}>›</Text>
                    <Text style={s.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

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

        {/* Skills — comma-separated for minimal feel */}
        {hasSkills ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Skills</Text>
            {skillsIsArray ? (
              <Text style={s.skillsText}>{skillsToText(cv.skills)}</Text>
            ) : (
              <View>
                {SKILL_CATS.map(({ key, label }) => {
                  const arr = (cv.skills as CvSkills)[key] ?? [];
                  if (arr.length === 0) return null;
                  return (
                    <View key={key} style={s.skillCatRow}>
                      <Text style={s.skillCatLabel}>{label}</Text>
                      <Text style={s.skillCatText}>{arr.join(', ')}</Text>
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
