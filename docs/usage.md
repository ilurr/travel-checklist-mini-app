# Usage

## Personal checklist

1. Open the app (local or deployed).
2. You see a **trip** (e.g. "My first trip" with today’s date). Each trip has a **destination**, **date**, and its own packing list with categories (Documents, Clothing, Toiletries, etc.) and items.
3. **Switch trip**: Use the "Trip" dropdown to select another trip, or **Add trip** to create one (enter destination and date). You can **Edit trip** or **Delete trip**.
4. **Edit list**: For the selected trip, add or remove categories; add, check, or remove items. Everything is saved automatically in your browser (localStorage).
5. **Progress**: The header shows how many items are checked for the current trip. Use "Clear all checks" to reset checkboxes for that trip.

Your data never leaves your device unless you use "Share for 7 days".

## Sharing (stable 7-day link, shared editing)

1. Select the trip you want to share (destination + date + list).
2. Scroll to **Share this list** and click **Share for 7 days**.
   - **First time**: The app creates a share and shows a **stable link**. The trip is linked to that share (same URL from now on).
   - **Later**: Clicking Share again **updates** the same link with your current list—no new URL. The link always shows the latest version you saved.
3. Copy and send the link (e.g. to your wife). Anyone with the link can open it and **edit the list directly**: add/remove categories and items, check boxes, change quantities. Changes are **saved automatically** to the server (debounced).
4. **Both can edit**: Person 1 can edit in the main app and click Share to push updates. Person 2 can edit in the shared-view page; their changes save automatically. **Last write wins**—whoever saves last (Share from app or auto-save from shared view) updates what everyone sees. Refresh to see the other person’s changes.
5. **Rolling 7-day expiry**: Each time someone updates via Share, the link stays valid for 7 more days. If no one updates for 7 days, the link expires.

**Tip**: Treat the link like a password—anyone with it can view (and, if they use the main app with that trip linked, update) the list until it expires.
