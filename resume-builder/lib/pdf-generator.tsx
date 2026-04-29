import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer';
import type { OptimizedCv } from '@/types';

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.woff',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Medium.woff',
      fontWeight: 500,
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Bold.woff',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
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
    color: '#1E3A5F',
    marginBottom: 5,
  },
  headerContactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  headerContact: {
    fontSize: 9,
    color: '#6b7280',
    marginRight: 12,
    marginBottom: 2,
  },
  divider: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1E3A5F',
    marginTop: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: '#1E3A5F',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  sectionDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    marginBottom: 10,
  },
  section: {
    marginBottom: 16,
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
  bullet: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 6,
  },
  bulletDot: {
    width: 10,
    color: '#9ca3af',
    fontSize: 9,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: '#374151',
    lineHeight: 1.55,
  },
  summary: {
    fontSize: 9.5,
    color: '#374151',
    lineHeight: 1.65,
    marginBottom: 16,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    fontSize: 8.5,
    color: '#1E3A5F',
    backgroundColor: '#eff6ff',
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

function CvDocument({ cv }: { cv: OptimizedCv }) {
  const contactParts = [cv.email, cv.phone, cv.location, cv.linkedin, cv.github, cv.website].filter(Boolean) as string[];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.headerName}>{cv.name}</Text>
        <View style={styles.headerContactRow}>
          {contactParts.map((part, i) => (
            <Text key={i} style={styles.headerContact}>
              {i > 0 ? '· ' : ''}{part}
            </Text>
          ))}
        </View>
        <View style={styles.divider} />

        {/* Summary */}
        {cv.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <View style={styles.sectionDivider} />
            <Text style={styles.summary}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {cv.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <View style={styles.sectionDivider} />
            {cv.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <View style={styles.expRow}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  <Text style={styles.expDuration}>{exp.duration}</Text>
                </View>
                <Text style={styles.expCompany}>{exp.company}</Text>
                {exp.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {cv.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.sectionDivider} />
            {cv.education.map((edu, i) => (
              <View key={i} style={styles.eduRow}>
                <View>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  <Text style={styles.eduSchool}>{edu.school}</Text>
                </View>
                <Text style={styles.eduYear}>{edu.year}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {cv.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.sectionDivider} />
            <View style={styles.skillsWrap}>
              {cv.skills.map((skill, i) => (
                <Text key={i} style={styles.skillBadge}>{skill}</Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* References */}
        {cv.references && cv.references.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>References</Text>
            <View style={styles.sectionDivider} />
            {cv.references.map((ref, i) => (
              <View key={i} style={styles.refRow}>
                <View>
                  <Text style={styles.refName}>{ref.name}</Text>
                  <Text style={styles.refTitle}>{ref.title}</Text>
                </View>
                <Text style={styles.refContact}>{ref.contact}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function generateResumePdf(cv: OptimizedCv): Promise<Buffer> {
  return renderToBuffer(<CvDocument cv={cv} />);
}
