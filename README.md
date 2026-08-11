# Shaik Shahul — Portfolio

Personal portfolio of **Shaik Shahul** — AI/ML Developer & Full-Stack Engineer.
Dark, animated single-page site: a percentage preloader with a Netflix-style zoom reveal, GSAP scroll animations, Lenis smooth scrolling, a custom cursor, an interactive hero character, and a pinned horizontal projects gallery.

## Run locally

Any static server works. From this folder:

```bash
python -m http.server 4173
```

Then open http://localhost:4173. (Opening `index.html` directly also works, but a server is closer to production.)

## Structure

```
index.html            — all content/sections
css/style.css         — full stylesheet (Geist font, #0b080c / #c2a4ff theme)
js/main.js            — loader, GSAP + ScrollTrigger + Lenis animations
assets/video/video.webm         — Tech Stack background video
assets/hero-character.png       — hero character (interactive parallax)
assets/projects/*.svg           — 8 minimal project cover images
assets/resume/Shaik_Shahul_Resume.pdf
```

## Sections

Hero (split-char intro, magnetic social icons, RESUME button) → About → Stats counters → What I Do (3-panel accordion) → Career timeline → My Work (pinned horizontal scroll, 8 projects + CTA) → Achievements → Tech Stack pyramid → CTA → Contact.

## Editing content

- **Projects**: edit the `.work-box` blocks in `index.html`; covers live in `assets/projects/`.
- **Resume**: replace `assets/resume/Shaik_Shahul_Resume.pdf` (keep the filename, or update the two links in `index.html`).
- **Colors**: change `--accentColor` / `--backgroundColor` in `css/style.css`.

## Deploy

- **Vercel**: `npx vercel` from this folder (or drag-and-drop the folder in the Vercel dashboard).
- **Hostinger / cPanel**: upload the folder contents to `public_html`.
- **GitHub Pages**: push to a repo, enable Pages on the root.

External dependencies (loaded from CDNs): Google Fonts (Geist), GSAP 3.12, Lenis 1.0, Three.js 0.160, Devicon icons.
