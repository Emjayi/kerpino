# Kerpino

**Kerpino** is a modern web application built with [Next.js](https://nextjs.org/), leveraging the power of [Tailwind CSS](https://tailwindcss.com/) for styling and [Bun](https://bun.sh/) as the JavaScript runtime. It is designed to provide a seamless and performant user experience.

## Live Demo

Check out the live application: [kerpino.vercel.app](https://app.kerpino.io)

## Features

- ⚡ **Next.js 14** – App Router architecture with optimized routing and performance.
- 🎨 **Tailwind CSS** – Utility-first CSS framework for rapid UI development.
- 🚀 **Bun** – Fast JavaScript runtime for efficient development and execution.
- 🧱 **TypeScript** – Strongly typed language for better code quality and maintainability.
- 🖋️ **Geist Font** – Modern and clean typography from Vercel.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Bun](https://bun.sh/)
- [Node.js](https://nodejs.org/) (if not using Bun)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/emjayi/kerpino.git
   cd kerpino
   ```

2. **Install dependencies:**

   Using Bun:

   ```bash
   bun install
   ```

   Or using npm:

   ```bash
   npm install
   ```

### Running the Development Server

Start the development server:

Using Bun:

```bash
bun dev
```

Or using npm:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Structure

```
kerpino/
├── public/             # Static assets
├── src/                # Source code
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Reusable UI components
│   └── styles/         # Global styles
├── .gitignore
├── bun.lockb
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Scripts

| Command       | Description                         |
|---------------|-------------------------------------|
| `bun dev`     | Start the development server        |
| `bun build`   | Build the application for production |
| `bun start`   | Start the production server         |
| `bun lint`    | Run ESLint to analyze code          |

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the [MIT License](LICENSE).

---

For more information, visit the [Next.js documentation](https://nextjs.org/docs) and the [Tailwind CSS documentation](https://tailwindcss.com/docs).
