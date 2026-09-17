export const metadata = {
  title: "Minzo AI — A little curiosity. A whole new superpower.",
  description:
    "Build real AI skills through bite-sized lessons, playful challenges and a journey that grows with you. Meet Minzo AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#fff9ef" />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%23ee7747'/%3E%3Cpath d='M14 45V22h8l10 12 10-12h8v23h-9V34l-9 10-9-10v11z' fill='%23fff9ef'/%3E%3C/svg%3E"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
