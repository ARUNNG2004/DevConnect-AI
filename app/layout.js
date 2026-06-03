import "./globals.css";

export const metadata = {
  title: "DevConnect AI",
  description: "DevConnect AI migrated to Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}