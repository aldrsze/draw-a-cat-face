# Draw A Cat Face

A fun web app where you can draw cat faces, save them to the cloud, and build your own cat gallery.

## Video or Image Presentation

![App Demo](./public/icon.ico)
*(Replace this with a link to your demo video or a screenshot)*

## Technologies

- **Frontend:** React 19, Vite
- **Backend/Storage:** Supabase (PostgreSQL & Storage)
- **Styling:** Vanilla CSS (Apple-inspired UI)

## Features

- **Interactive Canvas:** Draw cat faces on an HTML5 canvas with adjustable brush sizes.
- **Editing Tools:** Eraser tool, undo/redo functionality, and a basic color palette.
- **Cloud Storage:** Saves compressed images to Supabase Storage (optimized for performance).
- **Cat Gallery:** View and browse a collection of saved cat drawings.
- **Responsive Design:** Minimal, edge-to-edge UI that works on both mobile and desktop.
- **Security & Integrity:** Client-side rate-limiting, spam detection, and Supabase RLS policies.

## How I built it

The project is built as a modern React 19 application using Vite for a fast development experience. The core interaction happens on an HTML5 Canvas, which is managed via custom hooks for drawing logic. For the backend, I chose Supabase to handle both the database (storing metadata) and Storage (storing the actual image files). To keep it lightweight and fast, images are compressed before being uploaded.

## What I learned

*(Fill in your personal learnings here, e.g., challenges with Canvas API, working with Supabase RLS, or designing the minimal UI.)*

## Future Enhancements

- [ ] Social sharing functionality.
- [ ] More brush types and textures.
- [ ] User authentication for personal galleries.
- [ ] AI-assisted drawing suggestions.

## How to run the project

### Prerequisites
- Node.js (v18+)
- npm

### Steps
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd DrawACatFace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

[LICENSE](LICENSE) | MIT License
