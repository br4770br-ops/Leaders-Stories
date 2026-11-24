# LEADERS STORIES – Firestore Security Specification (Phase 0)

## 1. Data Invariants

1. **Strict UID Isolation & Admin Oversight**: Every document under `/users/{uid}` and its subcollections (`preferences`, `favorites`, `storyProgress`, `conversations`, `messages`, `relationships`, `memories`) belongs exclusively to `request.auth.uid == uid` with `request.auth.token.email_verified == true`. Only the verified Main Admin (`prabhuaj8@gmail.com` with `email_verified == true`) may list `/users` or update user `status` / `blockedReason` / `blockedAt` / `blockedBy`.
2. **No Self-Role Escalation**: Normal users may never create `role: 'admin'`, modify `role`, or change `status` to `'active'` once blocked. Main Admin cannot block themselves.
3. **Synchronous Block Enforcement**: Blocked users (`exists(/databases/$(database)/documents/blockedUsers/$(request.auth.uid))`) are denied all profile updates, story progress writes, conversations, messages, favorites, relationships, and memories, as well as backend API story generation routes.
4. **No Password Storage**: Passwords are never stored in Firestore schemas or rules.
5. **Temporal Integrity & Immutability**: `createdAt` and `updatedAt` timestamps must match `request.time`; `uid`, `email`, `storyId`, `conversationId`, and `createdAt` remain immutable after creation.
6. **Path Variable Hardening**: All document IDs (`uid`, `storyId`, `conversationId`, `messageId`, `memoryId`, `prefId`) match `^[a-zA-Z0-9_-]{1,128}$`.
7. **Global App Config & Stories**: `/appConfig/{docId}` (`settings`, `content`) and `/stories/{storyId}` (when `published == true`) are readable by the app; all creates/updates/deletes are restricted strictly to verified Main Admin `prabhuaj8@gmail.com`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Cross-UID Profile Read**: Non-admin user attempting `get /users/victim_uid`.
2. **Cross-UID Message Injection**: Signed-in attacker creating `/users/victim_uid/conversations/c1/messages/m1` with `uid: "attacker_uid"`.
3. **Unverified Email Bypass**: Newly registered user with `email_verified: false` attempting `set` on `/users/{uid}`.
4. **Role Escalation via Shadow Field or Role Edit**: Normal user creating/updating `/users/{uid}` with `"role": "admin"` or `"isAdmin": true`.
5. **Fake Client Timestamp**: User submitting `createdAt: "1999-01-01T00:00:00Z"` instead of `request.time`.
6. **ID Poisoning Attack**: Attacker targeting `/users/{uid}/favorites/../../admins/me` or a 2,000-character document ID.
7. **Blocked User Bypass**: Blocked user attempting to create a message or unblock themselves in `/users/{uid}`.
8. **Unbounded Array Flood**: Submitting a 500-element `choicesMade` array on `StoryProgress`.
9. **Immutable Owner Swap on Update**: Updating a `Conversation` document to change `uid` or `storyId`.
10. **Non-Admin AppConfig / Story Publish**: Regular verified user attempting to update `/appConfig/settings` or create `/stories/hacked_story`.
11. **Unpublished Draft Scraping**: Regular user attempting `get` or `list` on `/stories/secret_draft` where `published == false`.
12. **Non-Admin User Collection Scraping**: Regular user running `list` on `/users` or `/blockedUsers` to enumerate user emails.

All 12 payloads are asserted to fail with `PERMISSION_DENIED` in `firestore.rules.test.ts`.
