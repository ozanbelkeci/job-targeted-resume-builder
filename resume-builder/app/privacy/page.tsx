import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export const metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-[#1E3A5F] mb-3">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-[#1E3A5F] hover:underline mb-6 inline-block">
            ← Back to {APP_NAME}
          </Link>
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Effective date: May 2025</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 lg:p-12">

          <p className="text-gray-600 leading-relaxed mb-10">
            Coversume (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates coversume.com. This Privacy Policy explains
            how we collect, use, and protect your information when you use our Service. By using
            Coversume, you agree to the collection and use of information in accordance with this policy.
          </p>

          <Section title="1. Information We Collect">
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium text-gray-800">Account information:</span> Your email
                address and, if you sign in with Google, your name and profile picture.
              </li>
              <li>
                <span className="font-medium text-gray-800">Resume content:</span> The text content
                of your CV, which you upload or paste into the Service. This is stored as text —
                we do not store the original PDF file permanently.
              </li>
              <li>
                <span className="font-medium text-gray-800">Job descriptions:</span> The job listing
                text you paste into the Service for optimization.
              </li>
              <li>
                <span className="font-medium text-gray-800">Usage data:</span> Information about
                how you interact with the Service, including optimization history and feature usage.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, operate, and improve the resume optimization Service</li>
              <li>
                Send your CV text and job descriptions to the OpenAI API for AI-powered
                optimization — this is the core function of the Service
              </li>
              <li>Manage your account and process payments</li>
              <li>Send transactional emails (account confirmation, password reset)</li>
              <li>Respond to your support requests</li>
            </ul>
            <p className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
              We do not sell your personal data or resume content to third parties. We do not use
              your data for advertising purposes.
            </p>
          </Section>

          <Section title="3. Third-Party Services">
            <p>
              We use the following third-party services to operate Coversume. Each service has its
              own privacy policy governing how it handles your data:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium text-gray-800">Supabase</span> — Database and
                authentication. Your account data and resume content are stored in Supabase.
              </li>
              <li>
                <span className="font-medium text-gray-800">OpenAI API</span> — AI processing.
                Your CV text and job descriptions are sent to OpenAI to generate optimized content.
                OpenAI&apos;s data usage policies apply to API inputs.
              </li>
              <li>
                <span className="font-medium text-gray-800">Polar</span> — Payment processing.
                Polar handles all payment transactions. We do not store your payment card details.
              </li>
              <li>
                <span className="font-medium text-gray-800">Resend</span> — Email delivery for
                transactional emails such as account confirmation and password reset.
              </li>
              <li>
                <span className="font-medium text-gray-800">Vercel</span> — Application hosting
                and infrastructure.
              </li>
            </ul>
          </Section>

          <Section title="4. Data Storage and Security">
            <p>
              Your data is stored on Supabase&apos;s infrastructure, which uses industry-standard
              encryption at rest and in transit. We implement appropriate technical and
              organizational measures to protect your personal data against unauthorized access,
              alteration, disclosure, or destruction.
            </p>
            <p>
              However, no method of transmission over the internet or electronic storage is 100%
              secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your account data and resume content for as long as your account is active.
              If you delete your account or request data deletion, we will remove your personal data
              from our systems within 30 days, except where we are required to retain it for legal
              or compliance purposes.
            </p>
            <p>
              Optimization history is retained to allow you to access your past results. You may
              delete individual optimizations from your dashboard at any time.
            </p>
          </Section>

          <Section title="6. Your Rights (GDPR)">
            <p>
              If you are located in the European Economic Area, you have the following rights
              regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium text-gray-800">Right to access:</span> Request a copy
                of the personal data we hold about you.
              </li>
              <li>
                <span className="font-medium text-gray-800">Right to rectification:</span> Request
                correction of inaccurate personal data.
              </li>
              <li>
                <span className="font-medium text-gray-800">Right to erasure:</span> Request
                deletion of your personal data (&quot;right to be forgotten&quot;).
              </li>
              <li>
                <span className="font-medium text-gray-800">Right to data portability:</span> Request
                a copy of your data in a machine-readable format.
              </li>
              <li>
                <span className="font-medium text-gray-800">Right to object:</span> Object to
                processing of your personal data in certain circumstances.
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:support@coversume.com" className="text-[#1E3A5F] hover:underline font-medium">
                support@coversume.com
              </a>
              . We will respond to your request within 30 days.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              We use essential cookies to maintain your login session and provide the Service.
              These cookies are necessary for the Service to function and cannot be disabled.
            </p>
            <p>
              We do not use advertising cookies or third-party tracking cookies. We do not use
              Google Analytics or similar tracking tools.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              The Service is not directed to children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you believe we have
              inadvertently collected such information, please contact us immediately at
              support@coversume.com and we will delete it promptly.
            </p>
          </Section>

          <Section title="9. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by updating the effective date at the top of this page. We encourage you to
              review this policy periodically.
            </p>
            <p>
              Continued use of the Service after changes to this policy constitutes your acceptance
              of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact Information">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please contact us at:
            </p>
            <div className="mt-2 p-4 bg-[#F8FAFC] rounded-xl border border-gray-200">
              <p className="font-semibold text-gray-800">Coversume</p>
              <p className="text-sm mt-1">
                <a href="mailto:support@coversume.com" className="text-[#1E3A5F] hover:underline">
                  support@coversume.com
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-0.5">coversume.com</p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
