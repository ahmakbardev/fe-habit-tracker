✦ I have enhanced the push notifications for both habits and tasks with the following improvements:

   1. Visual Enhancements:
       * Titles: Now include emojis (e.g., 🔥 for habits, 📌 for tasks) and the item name for immediate recognition.
       * Body: Personalized messages reminding the user of the specific habit/task and its timing.
       * Images: Added high-quality dynamic banner images from Unsplash (1200x80) to make notifications more engaging.
       * Icons & Badges: Set to /favicon.ico for consistent branding across different platforms.

   2. Interactive Buttons (Actions):
       * 🚀 Buka Aplikasi (view_app): Allows users to jump directly into the app.
       * ✅ Selesai (mark_done): Provides a quick way for users to complete their tasks or habits directly from the notification.

   3. Advanced Metadata:
       * Tags: Implemented unique tags (habit-{id} and todo-{id}) to ensure that if a notification is updated, it replaces the old one instead of cluttering the user's screen.
       * Data Object: Includes the item ID and target URL (/habits or /tasks) for the frontend to handle click interactions.
