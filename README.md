# Draw A Cat Face

A fun web app where you can draw cat faces, save them to the cloud, and build your own cat gallery.

## Video or Image Presentation

![App Demo](./DrawACatFace.gif)

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

During the development of DrawACatFace, I focused on bridging the gap between creative tools and cloud integration. Here are some key takeaways:

- **Canvas API & State Management:** I learned how to manage complex canvas states, including implementing a robust undo/redo system and handling high-DPI displays for crisp drawing results across different devices.
- **Efficient Cloud Storage Patterns:** Instead of storing heavy base64 strings in a database, I implemented a workflow to compress images on the client side before uploading them to Supabase Storage. This significantly improved app performance and reduced storage costs.
- **The "Less is More" Design Philosophy:** Adhering to Apple-inspired UI principles taught me the importance of typography (`SF Pro`) and purposeful color usage. Focusing on a single "Action Blue" helps keep the interface intuitive and clutter-free.
- **Serverless Security:** I gained experience in securing a public-facing application using Supabase Row Level Security (RLS) policies and client-side rate-limiting to prevent spam while maintaining an open, "low-friction" user experience.

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
