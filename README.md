<div align="center">
  <h2>
    An effortless video code diff-animation tool for visualizing code changes
  </h2>
</div>

<div align="center">
  <figure>
    <a href="https://code-motion.vercel.app/" target="_blank" rel="noopener">
			<img alt="Code-Motion" src='./src/assets/studio.webp'>
		</a>
    <figcaption>
      <p align="center">
        Present your code like never before.
      </p>
    </figcaption>
  </figure>
</div>

## Features

- 💯 Free & open-source
- 🤩 diff animation ([example](https://code-motion.vercel.app/assets/diff-anim-example-CQZ8pw7x.webm))
- 🏗️ canvas-based video
- 🎬 preview player
- 🖼️ Export video to mp4 (webm -> mp4 conversion at download time)
- ✍️ in-browser code editor
- 🎨 Customizable
- 📷 capture screenshots
- 🌓 Dark mode

## About This Fork

This repository is a vibe-coded fork of the original [code-motion](https://github.com/amasin76/code-motion).

Changes added in this fork:

- Fixed the video download flow so export is more reliable
- Added MP4 export by converting the generated WebM with FFmpeg at download time
- Replaced the old FPS control with a transition duration control
- Added snapshot/item display duration control (time shown before transitioning)

## TODO

- Video aspect ratio presets (square, portrait, landscape)
- Background color customization
- Visual effects on the video (for example: borders)

## Use Cases

- Creating programming video tutorials (youtube, udemy..).
- Assisting tutors in explaining code solutions effectively.
- Student showcasing specific code snippets during presentation.  
  ...

## Developing

Clone the repository, then you can run it locally or in a docker container

### locally

> [!TIP]
> Install pnpm [`npm i -g pnpm`] if not already installed

1. Install the dependencies

   ```sh
   pnpm run install
   ```

2. Run the app locally

   ```sh
   pnpm run dev
   ```

### Docker

1. Run in it a container

   ```sh
   docker-compose up
   ```

After running the app either locally or in docker, navigate to http://localhost:5173.

## Tech Stack

- TypeScript : A statically typed superset of JavaScript, for better DX
- React : A library for building user interfaces using components
- Tailwind : A utility-first CSS framework for rapid web development
- Zustand : A lightweight state management library for React
- Framer-Motion : A production-ready animation library for React
- Shadcn : A set of pre-designed ui components, accessible. customizable.
- CodeMirror : A code editor component for the web.
- DiffJs : A text differencing implementation based on the O(ND)Algorithm.
- PrismJs : A syntax highlighting library for code blocks