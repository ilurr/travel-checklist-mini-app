# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Trips**: Multiple trips with destination and date. Each trip has its own packing list. Switch via dropdown; add, edit, or delete trips.
- **Per-item quantity**: Each list item has a quantity (e.g. Passport: 3, Underwear: 20). Category headers show total quantity; new items default to 1.
- **Category completion highlight**: Category header background turns green when all items in that category are checked.
- **Delete confirmations**: Confirmation modal before removing an item, a category, or a trip. Cancel or confirm (Delete/Remove) to proceed.
- **True shared editing**: One stable share link per trip. First "Share for 7 days" creates the link; later shares update the same Supabase row so the URL stays the same and always shows the latest version. Both people can edit and "save" by clicking Share again (last-write-wins). Rolling 7-day expiry.

### Changed

- Shared links now include trip destination and date in the payload; shared view shows them when present.
- Share flow: trips store remoteId and remoteToken after first share; subsequent Share calls share-update. share-create response includes id and token.
- Category header “X items” now reflects the sum of item quantities, not the number of rows.

### Fixed

- (none)

---

## [0.1.0] – Initial

### Added

- Travel packing list (Vue 3 + Vite + Tailwind).
- Categories and checklist items; add/remove categories and items; check off items.
- Local storage for personal use (no login).
- Optional “Share for 7 days” via Supabase + Netlify Functions; shareable link with expiry.
- Default template (Documents, Clothing, Toiletries, Electronics, Miscellaneous).
- Docs: README, architecture, usage.
