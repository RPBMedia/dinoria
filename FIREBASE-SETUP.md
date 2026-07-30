# Firebase setup (optional)

Dinoria runs perfectly **without** Firebase: everyone plays as a guest and best
scores are saved on the device. Add Firebase to unlock **accounts**
(email/password + Google) and the **global leaderboard**. Later milestones add
cloud saves, achievements, and collections on top of the same project.

## 1. Create a Firebase project

1. Go to <https://console.firebase.google.com> → **Add project** → name it
   (e.g. "Dinoria").
2. In the project, open **Build → Authentication → Get started** and enable:
   - **Email/Password**
   - **Google**
3. Open **Build → Firestore Database → Create database** (start in **production
   mode**; rules below).

## 2. Get your web config

**Project settings (gear) → General → Your apps → Web app (`</>`)**. Copy the
config values.

## 3. Add environment variables

Create `.env.local` (and set the same vars in Vercel → Settings → Environment
Variables). All are **public** client keys (safe in the browser):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Restart `npm run dev`. The header now offers real sign-in and the Global
leaderboard tab goes live.

## 4. Firestore security rules

In **Firestore → Rules**, paste and publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read the leaderboard; only signed-in users can add their own
    // score, and nobody can edit or delete existing entries.
    match /scores/{doc} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.score is number
        && request.resource.data.score >= 0;
      allow update, delete: if false;
    }
  }
}
```

## 5. Authorized domains (for Google sign-in)

**Authentication → Settings → Authorized domains** → add your deploy domains
(`localhost` is there by default; add your `*.vercel.app` URL and `dinoria.com`).

That's it — no secret keys, no server. Guests keep working exactly as before;
signed-in players now sync to the global board.
