import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "DevConnect AI",
  description: "DevConnect AI migrated to Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}