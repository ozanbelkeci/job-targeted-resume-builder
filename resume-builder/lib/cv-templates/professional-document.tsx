import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { OptimizedCv, CvSkills } from '@/types';

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

    // ── Header ─────────────────────────────────────
    headerName: {
      fontFamily: 'Times-Bold',
      fontSize: 22,
      color: '#111111',
      textAlign: 'center',
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    headerJobTitle: {
      fontFamily: 'Times-Italic',
      fontSize: 11,
      color: '#444444',
      textAlign: 'center',
      marginBottom: 4,
    },
    headerDivider: {
      borderBottomWidth: 1.5,
      borderBottomColor: accentColor,
      marginVertical: 5,
    },
    headerContactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 0,
    },
    headerContact: {
      fontSize: 9,
      color: '#333333',
      fontFamily: 'Times-Roman',
    },
    headerContactSep: {
      fontSize: 9,
      color: '#888888',
      marginHorizontal: 5,
    },

    // ── Section ────────────────────────────────────
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontFamily: 'Times-Bold',
      fontSize: 11,
      color: '#111111',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      paddingBottom: 2,
      borderBottomWidth: 1,
      borderBottomColor: accentColor,
      marginBottom: 6,
    },

    // ── Summary ────────────────────────────────────
    summary: {
      fontSize: 9.5,
      color: '#222222',
      lineHeight: 1.6,
      fontFamily: 'Times-Roman',
    },

    // ── Experience ─────────────────────────────────
    expBlock: {
      marginBottom: 10,
    },
    expHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    expCompany: {
      fontFamily: 'Times-Bold',
      fontSize: 10.5,
      color: '#111111',
    },
    expDuration: {
      fontFamily: 'Times-Roman',
      fontSize: 9,
      color: '#555555',
    },
    expTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 4,
    },
    expTitle: {
      fontFamily: 'Times-Italic',
      fontSize: 10,
      color: '#333333',
    },
    bullet: {
      flexDirection: 'row',
      marginBottom: 3,
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
      fontFamily: 'Times-Roman',
    },

    // ── Education ──────────────────────────────────
    eduBlock: {
      marginBottom: 8,
    },
    eduHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    eduSchool: {
      fontFamily: 'Times-Bold',
      fontSize: 10.5,
      color: '#111111',
    },
    eduYear: {
      fontFamily: 'Times-Roman',
      fontSize: 9,
      color: '#555555',
    },
    eduDegree: {
      fontFamily: 'Times-Italic',
      fontSize: 10,
      color: '#333333',
      marginTop: 1,
    },

    // ── Skills ─────────────────────────────────────
    skillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 4,
      alignItems: 'flex-start',
    },
    skillCatLabel: {
      fontFamily: 'Times-Bold',
      fontSize: 9.5,
      color: '#111111',
    },
    skillCatValues: {
      fontFamily: 'Times-Roman',
      fontSize: 9.5,
      color: '#333333',
      flex: 1,
      flexWrap: 'wrap',
    },
    skillPills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    skillPill: {
      fontFamily: 'Times-Roman',
      fontSize: 9.5,
      color: '#333333',
      marginRight: 6,
      marginBottom: 3,
    },
  });
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

  const contactParts = [cv.email, cv.phone, cv.location, cv.linkedin, cv.github, cv.portfolio, cv.website]
    .filter(Boolean) as string[];

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <Text style={s.headerName}>{cv.name}</Text>
        {cv.job_title ? <Text style={s.headerJobTitle}>{cv.job_title}</Text> : null}
        <View style={s.headerDivider} />
        <View style={s.headerContactRow}>
          {contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Text style={s.headerContactSep}>|</Text>}
              <Text style={s.headerContact}>{part}</Text>
            </React.Fragment>
          ))}
        </View>

        {/* ── Summary ── */}
        {cv.summary ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Summary</Text>
            <Text style={s.summary}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* ── Experience ── */}
        {cv.experience.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Experience</Text>
            {cv.experience.map((exp, i) => (
              <View key={i} style={s.expBlock}>
                <View style={s.expHeaderRow}>
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
        {cv.education.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Education</Text>
            {cv.education.map((edu, i) => (
              <View key={i} style={s.eduBlock}>
                <View style={s.eduHeaderRow}>
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
            <Text style={s.sectionTitle}>Skills</Text>
            {skillsIsArray ? (
              <View style={s.skillPills}>
                {(cv.skills as string[]).map((skill, i) => (
                  <Text key={i} style={s.skillPill}>{skill}{i < (cv.skills as string[]).length - 1 ? ',' : ''}</Text>
                ))}
              </View>
            ) : (
              <>
                {SKILL_CATS.map(({ key, label }) => {
                  const arr = (cv.skills as CvSkills)[key] ?? [];
                  if (arr.length === 0) return null;
                  return (
                    <View key={key} style={s.skillRow}>
                      <Text style={s.skillCatLabel}>{label}: </Text>
                      <Text style={s.skillCatValues}>{arr.join(', ')}</Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        ) : null}

      </Page>
    </Document>
  );
}
