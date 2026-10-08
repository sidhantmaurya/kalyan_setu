import React from 'react';
import { Link } from 'react-router-dom';
import { SectionLabel } from '../components/ReusableBlocks';

export function PrivacyPage() {
  return (
    <div>
      <section className="bg-[#1A2A4A] text-white py-14 md:py-20 px-4 sm:px-6 text-center border-b-2 border-[#C9A227]">
        <div className="max-w-[800px] mx-auto">
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-white mb-3">
            Privacy Policy
          </h1>
          <p className="font-garamond italic text-xl text-[#E8C96A]">
            How KalyanSetu handles and protects your information.
          </p>
        </div>
      </section>

      <section className="bg-[#F5EFE0] py-16 px-4 sm:px-6">
        <div className="max-w-[820px] mx-auto bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-8 md:p-12 space-y-6 text-[#3D3520] leading-relaxed">
          <SectionLabel>DATA &amp; PRIVACY TRANSPARENCY</SectionLabel>

          <div>
            <h2 className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect only the minimum information required to communicate with you and provide
              account features:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#3D3520]">
              <li>
                <strong>Contact Form Submissions:</strong> Full name, email address, optional phone
                number, reason for contact, and your message text.
              </li>
              <li>
                <strong>Google Sign-In (Optional):</strong> When you sign in with Google, we request
                only basic profile scopes (<code>openid</code>, <code>email</code>,{' '}
                <code>profile</code>) to receive your Google display name, email address, and
                profile photo URL. We never handle or store passwords.
              </li>
              <li>
                <strong>Newsletter Subscriptions:</strong> Your email address when you subscribe in
                the website footer.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-2">
              2. Why We Store Your Information &amp; Who Can See It
            </h2>
            <p>
              Your details are used strictly to read and reply to your messages, allow you to view
              your conversation history on your dashboard, and share occasional milestone updates if
              you subscribed to the newsletter. Only Founder Divyansh Rai and authorised KalyanSetu
              admin team members can view submitted messages and registered user profiles.
            </p>
          </div>

          <div>
            <h2 className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-2">
              3. Database Storage &amp; Security
            </h2>
            <p>
              All data is stored in our managed PostgreSQL database with strict server-side role
              access controls, encrypted connections (HTTPS), and daily automated backups.
            </p>
          </div>

          <div>
            <h2 className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-2">
              4. Account &amp; Data Deletion
            </h2>
            <p>
              If you have signed in with Google, you can delete your profile at any time using the{' '}
              <strong>Delete my account</strong> option on your{' '}
              <Link to="/dashboard" className="text-[#1A2A4A] font-bold underline">
                Dashboard
              </Link>
              . You may also request complete deletion of any contact messages or newsletter
              records by writing to us via the{' '}
              <Link to="/contact" className="text-[#1A2A4A] font-bold underline">
                Contact page
              </Link>{' '}
              or emailing <strong>rdivyansh088@gmail.com</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function TermsPage() {
  return (
    <div>
      <section className="bg-[#1A2A4A] text-white py-14 md:py-20 px-4 sm:px-6 text-center border-b-2 border-[#C9A227]">
        <div className="max-w-[800px] mx-auto">
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-white mb-3">
            Terms of Use
          </h1>
          <p className="font-garamond italic text-xl text-[#E8C96A]">
            Guidelines for using the KalyanSetu website.
          </p>
        </div>
      </section>

      <section className="bg-[#F5EFE0] py-16 px-4 sm:px-6">
        <div className="max-w-[820px] mx-auto bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-8 md:p-12 space-y-6 text-[#3D3520] leading-relaxed">
          <SectionLabel>TERMS &amp; CONDITIONS</SectionLabel>

          <div>
            <h2 className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-2">
              1. About KalyanSetu
            </h2>
            <p>
              KalyanSetu is an early-stage for-profit social impact initiative founded by Divyansh
              Rai, focused on affordable and dignified food access (NIC Code: 56100). Information on
              this website describes our mission, current incorporation progress, and upcoming pilot
              plans.
            </p>
          </div>

          <div>
            <h2 className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-2">
              2. Acceptable Use
            </h2>
            <p>
              When using our contact form or signing in with Google, you agree to provide accurate
              contact details and not to submit automated spam, malicious scripts, or abusive
              content. Submissions are rate-limited to protect service availability.
            </p>
          </div>

          <div>
            <h2 className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-2">
              3. Intellectual Property
            </h2>
            <p>
              The KalyanSetu name, visual identity, taglines, and website copy are the property of
              KalyanSetu and its founder. Please reach out via our{' '}
              <Link to="/contact" className="text-[#1A2A4A] font-bold underline">
                Contact page
              </Link>{' '}
              for media or partnership inquiries.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
