# EUTCO Logistics — Warehouse Packing List

## Files
- `index.html` — page structure
- `styles.css` — interface, pallet colors and print/PDF layout
- `app.js` — numbering, BOEs, catalogue, pallets, totals, saved name suggestions and exports

## Run locally
Open `index.html` in a modern browser, or open this folder in VS Code and use Live Server.

## Host temporarily on GitHub Pages
1. Create a GitHub repository.
2. Upload all three files to the repository root.
3. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
4. Open the published Pages URL after deployment finishes.

## Features
Automatic `EUT-PL-0001` style list numbers; date; saved customer and preparer suggestions; multiple BOE references; item/model catalogue; multiple item rows per pallet; duplicate individual or multiple pallets; automatic totals by model and shipment; PDF printing; Excel-compatible CSV; JSON backup.

## Print / PDF
Use **Print / Save PDF** and choose **Save as PDF**. In the print dialog use A4 landscape and enable background graphics for the pallet color bands. The print-only report excludes the editor controls. BOE references have their own column/section; model totals are shown in the model summary's Total Qty column. Long pallet tables continue across pages with repeated headings.

## Storage caveat
This is a front-end-only temporary app. Data and saved names live in the current browser's local storage. A static GitHub Pages website does not sync records between computers or browsers. Export JSON backups regularly. Shared numbering and shared data require a backend/database.
