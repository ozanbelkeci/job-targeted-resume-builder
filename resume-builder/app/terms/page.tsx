import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export const metadata = {
  title: `Terms of Service | ${APP_NAME}`,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-[#1E3A5F] mb-3">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-[#1E3A5F] hover:underline mb-6 inline-block">
            ← Back to {APP_NAME}
          </Link>
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400">Effective date: May 2025</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 lg:p-12">

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Coversume (&quot;the Service&quot;) at coversume.com, you agree to be
              bound by these Terms of Service. If you do not agree to these terms, please do not
              use the Service.
            </p>
            <p>
              These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Coversume is an AI-powered resume optimization platform that helps job seekers tailor
              their CVs to specific job listings. The Service uses artificial intelligence to analyze
              your resume and job descriptions, generate optimized content, calculate ATS (Applicant
              Tracking System) compatibility scores, and produce professional PDF resumes.
            </p>
            <p>
              Additional features available to Pro subscribers include cover letter generation and
              LinkedIn profile optimization suggestions.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              To access the Service, you must create an account using a valid email address or Google
              OAuth. You are responsible for maintaining the confidentiality of your account
              credentials and for all activity that occurs under your account.
            </p>
            <p>
              You must be at least 13 years old to use the Service. By creating an account, you
              represent that you meet this requirement.
            </p>
            <p>
              You agree to provide accurate and complete information when creating your account and
              to update your information to keep it accurate and current.
            </p>
          </Section>

          <Section title="4. Payments and Refunds">
            <p>
              Coversume offers paid plans including one-time credit packages and monthly
              subscriptions. All prices are displayed in US dollars.
            </p>
            <p>
              One-time purchases (credit packages and lifetime access) are non-refundable once the
              credits have been used. If you have unused credits and experience a technical issue
              on our end, please contact support@coversume.com.
            </p>
            <p>
              Monthly subscriptions can be cancelled at any time. Cancellation takes effect at the
              end of the current billing period. We do not offer prorated refunds for partial
              subscription periods.
            </p>
            <p>
              Payments are processed securely by Paddle. Coversume does not store your payment card
              information.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              The Service, including its design, code, and content created by Coversume, is owned
              by Coversume and protected by applicable intellectual property laws.
            </p>
            <p>
              AI-generated resume content produced using your input data is provided for your
              personal use. You retain ownership of your original resume content and job description
              data.
            </p>
          </Section>

          <Section title="6. User Content">
            <p>
              You retain full ownership of the content you submit to the Service, including your CV
              text and job descriptions (&quot;User Content&quot;). By submitting User Content, you grant
              Coversume a limited license to process and store that content solely for the purpose
              of providing the Service to you.
            </p>
            <p>
              You are solely responsible for the accuracy of your User Content. Do not upload
              sensitive personal information beyond what is necessary for resume optimization.
            </p>
          </Section>

          <Section title="7. Privacy and Data">
            <p>
              Your use of the Service is also governed by our{' '}
              <Link href="/privacy" className="text-[#1E3A5F] hover:underline font-medium">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. By using the Service, you
              consent to the collection and use of your data as described in the Privacy Policy.
            </p>
          </Section>

          <Section title="8. Prohibited Uses">
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Violate any applicable laws or regulations</li>
              <li>Submit false, misleading, or fraudulent content</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use automated tools to scrape or extract data from the Service</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
            </ul>
          </Section>

          <Section title="9. Disclaimers">
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              either express or implied. Coversume does not warrant that the Service will be
              uninterrupted, error-free, or that AI-generated content will be accurate or suitable
              for any particular purpose.
            </p>
            <p>
              Resume optimization increases your chances of passing automated screening systems but
              does not guarantee job interviews or employment outcomes.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Coversume shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your
              use of the Service, including but not limited to loss of data, loss of revenue, or
              failure to obtain employment.
            </p>
            <p>
              Our total liability to you for any claim arising from these Terms or your use of the
              Service shall not exceed the amount you paid to Coversume in the twelve months
              preceding the claim.
            </p>
          </Section>

          <Section title="11. Changes to Terms">
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of
              material changes by updating the effective date at the top of this page. Continued
              use of the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="12. Contact Information">
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@coversume.com" className="text-[#1E3A5F] hover:underline font-medium">
                support@coversume.com
              </a>
              .
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}
