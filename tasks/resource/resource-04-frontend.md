# Task resource-04 — Frontend: Facilities Page + Admin CRUD

## Goal
Build the FacilitiesPage where any user can browse/filter rooms and their equipment, and admin-only modals to create/edit/delete rooms and equipment.

## Prerequisite
resource-01, resource-02, resource-03

## Context
- `frontend-web/src/pages/FacilitiesPage.jsx` — exists but likely skeleton
- `frontend-web/src/hooks/useResources.js` — exists, check current shape
- `frontend-web/src/api/axios.js` — configured axios instance
- `frontend-web/src/layouts/MainLayout.jsx` + `AdminLayout.jsx` — use correct layout
- `frontend-web/src/App.jsx` — add route if missing
- No auth yet — skip role checks; admin features always visible for now (auth-04 adds role guards)

## What to build
- `frontend-web/src/api/resourceApi.js` (new) — API calls for resources + equipment
- `frontend-web/src/hooks/useResources.js` (modify) — use resourceApi, support filter params
- `frontend-web/src/components/ResourceCard.jsx` (new) — card showing room info + equipment badges
- `frontend-web/src/components/ResourceFormModal.jsx` (new) — create/edit room form
- `frontend-web/src/components/EquipmentFormModal.jsx` (new) — add/edit equipment in a room
- `frontend-web/src/pages/FacilitiesPage.jsx` (modify) — filter bar + resource grid + admin buttons

## Steps
1. `resourceApi.js`: functions `getResources(params)`, `getResourceById(id)`, `createResource(data)`, `updateResource(id, data)`, `deleteResource(id)`, `getEquipment(roomId)`, `addEquipment(roomId, data)`, `updateEquipment(id, data)`, `deleteEquipment(id)`. Use `axios` from `api/axios.js`.
2. `useResources.js`: expose `resources`, `loading`, `error`, `fetchResources(filters)`, `createResource`, `updateResource`, `deleteResource`.
3. `ResourceCard.jsx`: shows name, type badge, location, capacity, status chip, list of equipment type chips. "Edit" + "Delete" buttons (admin only — use prop `isAdmin` for now).
4. `FacilitiesPage.jsx`:
   - Filter bar: dropdowns for type (ALL/LAB/LECTURE_HALL/MEETING_ROOM), equipment (ALL/PROJECTOR/…), min capacity input, date+time pickers for slot.
   - On filter change: call `fetchResources(filters)`.
   - Grid of `ResourceCard` components.
   - "Add Room" button (admin) → opens `ResourceFormModal`.
   - Each card has "Manage Equipment" link → inline accordion or separate panel showing equipment + "Add Equipment" button.
5. `ResourceFormModal.jsx`: controlled form with name, type select, location, capacity, status, imageUrl. Submit calls `createResource` or `updateResource`.
6. `EquipmentFormModal.jsx`: name, type select (PROJECTOR etc.), status. Submit calls `addEquipment` or `updateEquipment`.

## Verification
1. `cd frontend-web && npm run dev`
2. Navigate to `/facilities` — room cards visible with equipment badges.
3. Filter by type=LAB — only labs shown.
4. Click "Add Room" — modal opens, submit → card appears.
5. Click "Add Equipment" on a room → equipment appears in card.

## When done
Mark `- [x] resource/resource-04` in `tasks/PROGRESS.md`.
