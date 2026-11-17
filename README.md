# Portfolio

Personal portfolio site for Michael Joongmin Park. Plain HTML, CSS, and JavaScript, with no build step and no dependencies.

## Structure

```
index.html            Page markup (header, hero, work strip, about, experience, contact)
css/styles.css        All styles: tokens, light/dark themes, desktop strip, mobile layout
js/projects.js        Project content (edit this to change the work section)
js/main.js            Work strip behaviour: open/close, push animation, chevrons, theme
assets/images/        Thumbnails (4:3) and the CF mark used by the Sherway card
assets/video/         Put project videos here (optional)
```

## Run locally

Open the folder in VS Code and use any static server, for example:

- The **Live Server** extension: right-click `index.html` → Open with Live Server
- Or in a terminal: `npx serve .` or `python3 -m http.server`

Opening `index.html` directly in a browser also works.

## Editing projects

Everything about a project lives in `js/projects.js`:

- `poster`: 4:3 image, e.g. `"assets/images/clink.webp"`
- `video`: optional mp4, e.g. `"assets/video/clink.mp4"`. It plays muted and looped while the card is open.
- `category`: comma-separated, and each part becomes a pill on the card (`"Thesis project, AR app"`)
- `kpi`: always three items
- `href`: case study page for the "View case study" button

The order of the array is the order on the page.

## Theme

Light and dark themes follow the visitor's system setting until they use the switch in the header. Their choice is remembered in `localStorage`. Colours are CSS variables at the top of `css/styles.css` (`:root` for light, `[data-theme="dark"]` for dark).

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.

The site will be live at `https://<username>.github.io/<repo>/`. All paths are relative, so it works from a subfolder like that. The empty `.nojekyll` file tells Pages to serve the files as they are.

## Notes

- Fonts load from Google Fonts: Hanken Grotesk for the page, and Figtree for the "The New Roots" title, chosen as the closest free match to the Cadillac Fairview wordmark.
- The "View case study" links and the Résumé link still point to `michaeljpark.github.io/portfolio2026/`. Update them in `js/projects.js` and `index.html` once the case study pages move.
