# Google OAuth Branding & Consent Screen Configuration Guide

## Overview
When users sign in or sign up via Google OAuth on EduFlow, the Google OAuth consent screen displays application metadata.
Currently, users see the raw Supabase URL (`mtchdghzlkiemwtzyduo.supabase.co`) because:
1. Google Cloud Console OAuth 2.0 Client credentials have not had the **OAuth Consent Screen** app name and brand domains configured.
2. The Supabase project is using its default project domain instead of a Custom Domain or custom auth domain.

Follow this production checklist to display **"EduFlow OS"** and `auth.eduflow.pk` on the Google consent screen.

---

## 1. Google Cloud Console Configuration

### A. Configure OAuth Consent Screen
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **OAuth consent screen**.
2. **App Information**:
   - **App name**: `EduFlow OS` (or `EduFlow Institutional Edition`)
   - **User support email**: `support@eduflow.pk` (or your administrator Gmail/Google Workspace email)
   - **App logo**: Upload the EduFlow crest (`public/favicon.ico` or 120x120 SVG/PNG)
3. **App Domain**:
   - **Application home page**: `https://eduflow.pk` (or your production Vercel domain)
   - **Application privacy policy link**: `https://eduflow.pk/privacy`
   - **Application terms of service link**: `https://eduflow.pk/terms`
4. **Authorized Domains**:
   - Add: `eduflow.pk`
   - Add: `supabase.co`
5. **Developer Contact Information**:
   - Email: `support@eduflow.pk`
6. Click **Save and Continue**.

### B. Configure Scopes
- Add `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
- Click **Save and Continue**.

### C. Publishing Status
- In **Audience**, switch Publishing Status from **Testing** to **In Production** (or add test users if verifying in sandbox).

---

## 2. Supabase Dashboard Configuration

### A. Google Provider Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/mtchdghzlkiemwtzyduo) -> **Authentication** -> **Providers** -> **Google**.
2. Ensure **Enable Google provider** is switched **ON**.
3. Set **Client ID** (from Google Cloud Console).
4. Set **Client Secret** (from Google Cloud Console).
5. Copy the **Callback URL (for OAuth)**:
   `https://mtchdghzlkiemwtzyduo.supabase.co/auth/v1/callback`
6. In Google Cloud Console -> **Credentials** -> **OAuth 2.0 Client IDs** -> Your Client:
   - Paste that Callback URL under **Authorized redirect URIs**.
   - Under **Authorized JavaScript origins**, add `https://eduflow.pk` and `https://mtchdghzlkiemwtzyduo.supabase.co`.

### B. Custom Domain (Optional but Recommended)
To completely replace `mtchdghzlkiemwtzyduo.supabase.co` with your own domain (e.g., `auth.eduflow.pk`):
1. In Supabase Dashboard -> **Project Settings** -> **Custom Domains**.
2. Enter `auth.eduflow.pk`.
3. Add the required CNAME and TXT DNS records to your DNS provider (Cloudflare, Namecheap, Route 53).
4. Once verified, update the Google OAuth Authorized redirect URI to:
   `https://auth.eduflow.pk/auth/v1/callback`
5. Update `NEXT_PUBLIC_SUPABASE_URL` in `.env.production` to `https://auth.eduflow.pk`.

---

## 3. Client & Redirect Validation

```ts
const appUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://eduflow.pk')
const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${appUrl}/auth/callback?next=/admin`,
    queryParams: {
      prompt: 'select_account',
      access_type: 'offline',
    },
  },
})
```
This ensures:
1. `prompt: 'select_account'` lets users pick their institutional Google Workspace or Gmail account.
2. The user is redirected back to `/auth/callback?next=/admin` where session cookies are exchanged seamlessly.
