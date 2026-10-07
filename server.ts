import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { sendAdminContactNotification, buildContactEmailHtml } from './src/lib/email.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  // robots.txt (Section 12.2 & 18.5: Disallow /admin)
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /admin\n');
  });

  // Transactional Email Notification Endpoint for Firestore Contact Submissions (Section 15)
  app.post('/api/contact/notify', async (req, res) => {
    try {
      const { id, fullName, email, phone, reason, message, isSignedIn, profileEmail, createdAt } =
        req.body || {};

      if (!fullName || !email || !reason || !message) {
        return res.status(400).json({ error: 'Missing required notification fields.' });
      }

      const result = await sendAdminContactNotification({
        id: id || 'msg',
        fullName: String(fullName),
        email: String(email),
        phone: phone ? String(phone) : null,
        reason: String(reason),
        message: String(message),
        isSignedIn: Boolean(isSignedIn),
        profileEmail: profileEmail ? String(profileEmail) : null,
        createdAt: createdAt || new Date().toISOString(),
      });

      res.json(result);
    } catch (error: any) {
      console.error('Failed to send contact notification:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to send admin notification email',
      });
    }
  });

  // Admin Email Preview Endpoint
  app.post('/api/contact/email-preview', (req, res) => {
    try {
      const { id, fullName, email, phone, reason, message, isSignedIn, profileEmail, createdAt } =
        req.body || {};
      const siteUrl = process.env.SITE_URL || process.env.APP_URL || 'https://kalyansetu.in';
      const html = buildContactEmailHtml(
        {
          id: id || 'msg',
          fullName: String(fullName || ''),
          email: String(email || ''),
          phone: phone ? String(phone) : null,
          reason: String(reason || 'General Inquiry'),
          message: String(message || ''),
          isSignedIn: Boolean(isSignedIn),
          profileEmail: profileEmail ? String(profileEmail) : null,
          createdAt: createdAt || new Date().toISOString(),
        },
        siteUrl
      );
      res.json({ html });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to build email preview' });
    }
  });

  // Vite middleware for development vs static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KalyanSetu server running on http://localhost:${PORT}`);
  });
}

startServer();
