# LEADERS STORIES – Firestore Security Specification (Phase 0)

## 1. Data Invariants

1. **Strict UID Isolation**: Every document under `/users/{uid}` and its subcollections (`preferences`, `favorites`, `storyProgress`, `conversations`, `messages`, `relationships`, `memories`) MUST belong exclusively to `request.auth.uid == uid` with `request.auth.token.email_verified == true`.
2. **No Cross-User Queries or Enumeration**: `list` on `/users` and `/users/{uid}` is forbidden; `list` on any user subcollection requires `resource.data.uid == request.auth.uid`.
3. **Temporal Integrity**: `createdAt` and `updatedAt` timestamps on creates and updates must equal `request.time`.
4. **Immutable Ownership & Identifiers**: Once created, `uid`, `storyId`, `conversationId`, and `createdAt` cannot be reassigned.
5. **Path Variable Hardening**: All document IDs (`uid`, `storyId`, `conversationId`, `messageId`, `memoryId`, `prefId`) must match `^[a-zA-Z0-9_-]{1,128}$`.
6. **Admin Story Governance**: Only verified admins (`exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or verified bootstrap admin email `br4770br@gmail.com`) may create, update, or delete `/stories/{storyId}` or `/admins/{uid}`.
7. **No Unbounded Arrays or Shadow Fields**: Every collection uses `keys().hasAll(...)` and `keys().hasOnly(...)` on create and `affectedKeys().hasOnly(...)` on update, with explicit `.size()` bounds on all strings and lists.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Cross-UID Profile Read**: Unauthenticated or mismatched `uid` attempting `get /users/victim_uid`.
2. **Cross-UID Message Injection**: Signed-in attacker creating `/users/victim_uid/conversations/c1/messages/m1` with `uid: "attacker_uid"`.
3. **Unverified Email Bypass**: Newly registered user with `email_verified: false` attempting `set` on `/users/{uid}`.
4. **Shadow Field Privilege Escalation**: User adding `"role": "admin"` or `"isAdmin": true` to `/users/{uid}`.
5. **Fake Client Timestamp**: User submitting `createdAt: "1999-01-01T00:00:00Z"` instead of `request.time`.
6. **ID Poisoning Attack**: Attacker targeting `/users/{uid}/favorites/../../admins/me` or a 2,000-character document ID.
7. **Oversized String Denial-of-Wallet**: Submitting a 200KB `userText` payload inside a `ChatMessage`.
8. **Unbounded Array Flood**: Submitting a 500-element `choicesMade` array on `StoryProgress`.
9. **Immutable Owner Swap on Update**: Updating a `Conversation` document to change `uid` or `storyId`.
10. **Non-Admin Story Publish**: Regular verified user attempting to create or publish `/stories/hacked_story`.
11. **Unpublished Draft Scraping**: Regular user attempting `get` or `list` on `/stories/secret_draft` where `published == false`.
12. **User Collection Scraping**: Regular user running `list` on `/users` to enumerate user emails.

All 12 payloads are asserted to fail with `PERMISSION_DENIED` in `firestore.rules.test.ts`.
