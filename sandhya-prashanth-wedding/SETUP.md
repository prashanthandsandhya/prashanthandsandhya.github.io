# Sandhya & Prashanth Wedding Website — Setup Guide

## Step 1: Create a Firebase Project (Free — for RSVP + Guestbook)

1. Go to https://console.firebase.google.com/
2. Click "Create a project" → name it something like `sandhya-prashanth-wedding`
3. Disable Google Analytics (not needed) → Create
4. In the Firebase console, click the **</>** (Web) icon to add a web app
5. Register app name (e.g., "wedding-site") — no hosting needed
6. Copy the `firebaseConfig` object it gives you
7. Paste it into `js/app.js`, replacing the placeholder config

### Set up Realtime Database:
1. In Firebase console → Build → Realtime Database → Create Database
2. Choose your region → Start in **test mode** (we'll lock it down after)
3. Go to Rules tab and set:

```json
{
  "rules": {
    "rsvps": {
      ".read": false,
      ".write": true
    },
    "guestbook": {
      ".read": true,
      ".write": true
    },
    "gallery": {
      ".read": true,
      ".write": false
    }
  }
}
```

This allows:
- Anyone can submit RSVPs (write) but only you can read them (via Firebase console)
- Anyone can read AND write guestbook messages (so they display on the site)

### Set up Firebase Storage (for photos, drawings, videos):
1. In Firebase console → Build → Storage → Get started
2. Start in **test mode** → pick your region → Done
3. Go to Storage → Rules tab and set:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /guestbook/{file} {
      allow read, write: if request.resource.size < 150 * 1024 * 1024;
    }
    match /gallery/{file} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

This allows:
- Anyone can upload to `guestbook/` (max 50MB per file)
- Anyone can view gallery photos, but only you can upload them (via Firebase console)

## Step 2: Create a GitHub Account & Deploy

1. Go to https://github.com/join
2. Create a new account (e.g., `sandhya-and-prashanth` or `sandyprash2026`)
3. Create a new repository named `<username>.github.io` (e.g., `sandhya-and-prashanth.github.io`)
4. Push this code to that repo:

```bash
cd ~/sandhya-prashanth-wedding
git init
git add .
git commit -m "Initial wedding site"
git remote add origin https://github.com/<username>/<username>.github.io.git
git branch -M main
git push -u origin main
```

5. Your site will be live at `https://<username>.github.io` within a few minutes!

## Step 3: Add Photos to the Gallery

Photos are stored in Firebase Storage and loaded dynamically — no code changes needed!

1. In Firebase console → Storage → create a folder called `gallery`
2. Upload your photos there (any format: jpg, png, heic, etc.)
3. In Firebase console → Realtime Database → add entries under `gallery/`:

```json
{
  "gallery": {
    "photo1": {
      "url": "https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT/o/gallery%2Ftahoe.jpg?alt=media",
      "caption": "Lake Tahoe sunset",
      "order": 1,
      "size": "gi-tall"
    },
    "photo2": {
      "url": "https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT/o/gallery%2Fyosemite.jpg?alt=media",
      "caption": "Yosemite Valley",
      "order": 2,
      "size": ""
    }
  }
}
```

- `url`: copy the download URL from Firebase Storage after uploading
- `caption`: shows on hover (optional)
- `order`: controls display order (1 = first)
- `size`: `"gi-tall"` for tall images, `"gi-wide"` for panoramas, `""` for standard
- `type`: set to `"video"` for video files (auto-plays on hover, muted)

Photos appear on the site instantly — no git push needed!

## Optional: Custom Domain

If you buy a domain (e.g., `sandyandprash.com` from Namecheap/Google Domains ~$12/year):
1. In your GitHub repo → Settings → Pages → Custom domain → enter your domain
2. Add these DNS records at your registrar:
   - A record: `185.199.108.153`
   - A record: `185.199.109.153`
   - A record: `185.199.110.153`
   - A record: `185.199.111.153`
   - CNAME: `www` → `<username>.github.io`

## Viewing RSVPs

Go to Firebase Console → Realtime Database → expand `rsvps` to see all responses.
You can also export them as JSON.

## Updating the Site

Edit files locally, then:
```bash
git add .
git commit -m "Update"
git push
```
Changes go live in ~1 minute.
