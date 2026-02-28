# Usage

## Personal checklist

1. Open the app (local or deployed).
2. You see a **trip** (e.g. "My first trip" with today’s date). Each trip has a **destination**, **date**, and its own packing list with categories (Documents, Clothing, Toiletries, etc.) and items.
3. **Switch trip**: Use the "Trip" dropdown to select another trip, or **Add trip** to create one (enter destination and date). You can **Edit trip** or **Delete trip**.
4. **Edit list**: For the selected trip, add or remove categories; add, check, or remove items. Everything is saved automatically in your browser (localStorage).
5. **Progress**: The header shows how many items are checked for the current trip. Use "Clear all checks" to reset checkboxes for that trip.

Your data never leaves your device unless you use "Share for 7 days".

## Sharing (7-day link)

1. Select the trip you want to share (destination + date + list).
2. Scroll to **Share this list** and click **Share for 7 days**. The app sends a snapshot of that trip (destination, date, and list) to the server.
3. A **share link** appears (and can be copied). Example:  
   `https://your-site.netlify.app/#/shared/abc-123-uuid?t=secretToken`
4. Send this link to someone (e.g. your wife). They open it in their browser and see the same list (read-only).
5. The link **expires 7 days** after creation. After that, opening it shows "This shared link has expired."
6. Your local list is unchanged. You can create a new share link anytime.

**Tip**: Treat the link like a password—anyone with it can view the list until it expires.
