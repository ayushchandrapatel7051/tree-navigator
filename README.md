File Explorer Clone (N-ary Tree)

A modern, desktop-style File Explorer built with React, using an N-ary tree data structure to manage folders and files.
Features include dark/light mode, drag-and-drop, rename, delete, search, previews, and smooth UI animations.

---------------------------------------
FEATURES
---------------------------------------

1. Folder Tree (N-ary)
- Nested folder structure
- Expand/collapse animations
- Drag-and-drop to move files/folders
- Auto-expand on hover

2. Main Content Area
- Grid / List view toggle
- File & folder cards with modern icons
- Multi-select: Click, Ctrl/Cmd + Click, Shift + Range, Drag selection

3. File & Folder Operations
- Create new folders (auto-rename mode)
- Rename (F2, context menu, or double click)
- Delete with Undo (5 seconds)
- Move items via drag-and-drop
- Duplicate name detection

4. Search
- Instant search in current directory
- Highlights matching text
- Does not modify tree structure

5. Preview Panel
- Slide-in preview
- Shows name, type, size, creation date, modified date
- Supports text, markdown, and image previews

6. Dark & Light Mode
- Toggle button
- Animated transitions
- Saves preference in localStorage

7. Context Menu
- Open
- Rename
- Delete
- Move To...
- Copy Path
- Properties

8. Keyboard Shortcuts
Delete       → Delete/Backspace
Rename       → F2
Open         → Enter
Select All   → Ctrl/Cmd + A
Search       → Ctrl/Cmd + F
Copy/Paste   → Ctrl/Cmd + C / Ctrl/Cmd + V
Cancel       → Esc

---------------------------------------
N-ARY DATA MODEL
---------------------------------------

{
  id: string,
  name: string,
  type: folder | file,
  parentId: string | null,
  children: string[],
  meta: {
    mimeType?: string,
    size?: number,
    createdAt: ISODate,
    updatedAt: ISODate,
    preview?: string
  }
}

---------------------------------------
TECH STACK
---------------------------------------

- React
- Tailwind CSS
- Framer Motion
- Context + Reducer for global tree state
- LocalStorage persistence

---------------------------------------
PROJECT SETUP
---------------------------------------

git clone https://github.com/your-username/file-explorer-nary
cd file-explorer-nary

npm install
npm run dev

App runs at:
http://localhost:5173

---------------------------------------
PROJECT STRUCTURE
---------------------------------------

src/
  components/
  context/
  theme/
  utils/
  App.jsx
  main.jsx

---------------------------------------
MVP ACCEPTANCE CRITERIA
---------------------------------------

- Smooth expand/collapse in tree
- Create enters rename mode
- Rename updates UI + handles duplicates
- Delete shows Undo
- Move: drag-and-drop + Undo
- Search filters instantly
- Dark/light mode transitions smoothly
- Context menu opens on right-click
- Preview panel shows metadata
- State persists across refreshes

---------------------------------------
ROADMAP (POST-MVP)
---------------------------------------

- File upload
- Trash / Restore
- Sorting (name/date/type)
- Sharing & permissions
- Tags & metadata
- Cloud sync
- Virtualized rendering for huge trees

---------------------------------------
LICENSE
---------------------------------------

MIT License
