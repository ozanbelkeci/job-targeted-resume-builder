import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { OptimizedCv, CvSkills } from '@/types';

/*
  Professional template — Times-Roman serif, ATS-optimised.
  Rules:
  - NO React.Fragment / <> inside PDF render tree  →  silently drops content
  - NO unsupported CSS props (gap, gap-x, …)
  - Bold via fontFamily: 'Times-Bold', italic via 'Times-Italic' (standard PDF fonts)
*/

const SKILL_CATS: Array<{ key: keyof CvSkills; label: string }> = [
  { key: 'languages',     label: 'Languages' },
  { key: 'frameworks',    label: 'Frameworks' },
  { key: 'databases',     label: 'Databases' },
  { key: 'tools',         label: 'Tools' },
  { key: 'methodologies', label: 'Methodologies' },
];

function buildStyles(accentColor: string) {
  return StyleSheet.create({
    page: {
      fontFamily: 'Times-Roman',
      fontSize: 10,
      color: '#111111',
      paddingTop: 48,
      paddingBottom: 48,
      paddingLeft: 52,
      paddingRight: 52,
    },

    // ── Header ────────────────────────────────────────────────
    headerName: {
      fontFamily: 'Times-Bold',
      fontSize: 20,
      color: '#111111',
      textAlign: 'center',
      letterSpacing: 1.5,
      marginBottom: 2,
    },
    headerJobTitle: {
      fontFamily: 'Times-Italic',
      fontSize: 11,
      color: '#444444',
      textAlign: 'center',
      marginBottom: 5,
    },
    headerContact: {
      fontSize: 9,
      color: '#333333',
      textAlign: 'center',
      marginBottom: 6,
    },
    headerRule: {
      borderBottomWidth: 1,
      borderBottomColor: '#111111',
      marginBottom: 10,
    },

    // ── Section ───────────────────────────────────────────────
    section: {
      marginBottom: 10,
    },
    sectionHeaderWrap: {
      marginBottom: 5,
    },
    sectionTitleText: {
      fontFamily: 'Times-Bold',
      fontSize: 10.5,
      color: '#111111',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    sectionRule: {
      borderBottomWidth: 0.75,
      borderBottomColor: accentColor,
      marginTop: 2,
    },

    // ── Summary ───────────────────────────────────────────────
    summaryText: {
      fontSize: 9.5,
      color: '#222222',
      lineHeight: 1.55,
    },

    // ── Experience ────────────────────────────────────────────
    expBlock: {
      marginBottom: 9,
    },
    expRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    expCompany: {
      fontFamily: 'Times-Bold',
      fontSize: 10.5,
      color: '#111111',
    },
    expDuration: {
      fontFamily: 'Times-Roman',
      fontSize: 9,
      color: '#444444',
    },
    expTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    expTitle: {
      fontFamily: 'Times-Italic',
      fontSize: 10,
      color: '#333333',
    },
    bullet: {
      flexDirection: 'row',
      marginBottom: 2.5,
      paddingLeft: 8,
    },
    bulletDot: {
      width: 10,
      fontSize: 9,
      color: '#333333',
      marginTop: 1,
    },
    bulletText: {
      flex: 1,
      fontSize: 9.5,
      color: '#222222',
      lineHeight: 1.5,
    },

    // ── Education ─────────────────────────────────────────────
    eduBlock: {
      marginBottom: 7,
    },
    eduRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    eduSchool: {
      fontFamily: 'Times-Bold',
      fontSize: 10.5,
      color: '#111111',
    },
    eduYear: {
      fontFamily: 'Times-Roman',
      fontSize: 9,
      color: '#444444',
    },
    eduDegree: {
      fontFamily: 'Times-Italic',
      fontSize: 10,
      color: '#333333',
      marginTop: 1,
    },

    // ── Skills ────────────────────────────────────────────────
    skillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 3,
    },
    skillLabel: {
      fontFamily: 'Times-Bold',
      fontSize: 9.5,
      color: '#111111',
    },
    skillValues: {
      fontFamily: 'Times-Roman',
      fontSize: 9.5,
      color: '#333333',
      flex: 1,
    },
    skillsFlat: {
      fontFamily: 'Times-Roman',
      fontSize: 9.5,
      color: '#333333',
      lineHeight: 1.5,
    },
  });
}

function SectionHeader({ title, s }: { title: string; s: ReturnType<typeof buildStyles> }) {
  return (
    <View style={s.sectionHeaderWrap}>
      <Text style={s.sectionTitleText}>{title}</Text>
      <View style={s.sectionRule} />
    </View>
  );
}

export function ProfessionalDocument({
  cv,
  accentColor,
}: {
  cv: OptimizedCv;
  accentColor: string;
}) {
  const s = buildStyles(accentColor);
  const skillsIsArray = Array.isArray(cv.skills);
  const hasSkills = skillsIsArray
    ? (cv.skills as string[]).length > 0
    : SKILL_CATS.some(({ key }) => ((cv.skills as CvSkills)[key] ?? []).length > 0);

  const contactParts = [
    cv.email, cv.phone, cv.location, cv.linkedin, cv.github, cv.portfolio, cv.website,
  ].filter(Boolean) as string[];

  const contactLine = contactParts.join('   ·   ');

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <Text style={s.headerName}>{cv.name}</Text>
        {cv.job_title ? <Text style={s.headerJobTitle}>{cv.job_title}</Text> : null}
        {contactLine ? <Text style={s.headerContact}>{contactLine}</Text> : null}
        <View style={s.headerRule} />

        {/* ── Summary ── */}
        {cv.summary ? (
          <View style={s.section}>
            <SectionHeader title="Professional Summary" s={s} />
            <Text style={s.summaryText}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* ── Experience ── */}
        {cv.experience && cv.experience.length > 0 ? (
          <View style={s.section}>
            <SectionHeader title="Work Experience" s={s} />
            {cv.experience.map((exp, i) => (
              <View key={i} style={s.expBlock}>
                <View style={s.expRow}>
                  <Text style={s.expCompany}>{exp.company}</Text>
                  <Text style={s.expDuration}>{exp.duration}</Text>
                </View>
                <View style={s.expTitleRow}>
                  <Text style={s.expTitle}>{exp.title}</Text>
                </View>
                {exp.bullets.map((b, j) => (
                  <View key={j} style={s.bullet}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Education ── */}
        {cv.education && cv.education.length > 0 ? (
          <View style={s.section}>
            <SectionHeader title="Education" s={s} />
            {cv.education.map((edu, i) => (
              <View key={i} style={s.eduBlock}>
                <View style={s.eduRow}>
                  <Text style={s.eduSchool}>{edu.school}</Text>
                  <Text style={s.eduYear}>{edu.year}</Text>
                </View>
                <Text style={s.eduDegree}>{edu.degree}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Skills ── */}
        {hasSkills ? (
          <View style={s.section}>
            <SectionHeader title="Technical Skills" s={s} />
            {skillsIsArray ? (
              <Text style={s.skillsFlat}>{(cv.skills as string[]).join(', ')}</Text>
            ) : (
              <View>
                {SKILL_CATS.map(({ key, label }) => {
                  const arr = (cv.skills as CvSkills)[key] ?? [];
                  if (arr.length === 0) return null;
                  return (
                    <View key={key} style={s.skillRow}>
                      <Text style={s.skillLabel}>{label}: </Text>
                      <Text style={s.skillValues}>{arr.join(', ')}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

      </Page>
    </Document>
  );
}
