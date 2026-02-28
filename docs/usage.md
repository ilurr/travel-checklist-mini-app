# Usage

## Personal checklist

1. Open the app (local or deployed).
2. You see the default **Travel Packing List** with categories (Documents, Clothing, Toiletries, etc.) and sample items.
3. **Edit**: Add or remove categories; add, check, or remove items. Everything is saved automatically in your browser (localStorage).
4. **Progress**: The header shows how many items are checked. Use "Clear all checks" to reset checkboxes.

Your data never leaves your device unless you use "Share for 7 days".

## Sharing (7-day link)

1. On the main packing page, scroll to **Share this list**.
2. Click **Share for 7 days**. The app sends a snapshot of your current list to the server.
3. A **share link** appears (and can be copied). Example:  
   `https://your-site.netlify.app/#/shared/abc-123-uuid?t=secretToken`
4. Send this link to someone (e.g. your wife). They open it in their browser and see the same list (read-only).
5. The link **expires 7 days** after creation. After that, opening it shows "This shared link has expired."
6. Your local list is unchanged. You can create a new share link anytime.

**Tip**: Treat the link like a password—anyone with it can view the list until it expires.
