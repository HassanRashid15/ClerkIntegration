import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { light } from "@clerk/themes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SessionManager from "./components/SessionManager";
import LoadingSpinner from "./components/LoadingSpinner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Clerk App",
  description: "Example Clerk App",
};

export default async function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: light,
      }}
    >
      <html lang="en">
        <body className={inter.className + " min-h-screen flex flex-col"}>
          <Header />
          <main className="flex-grow flex-shrink-0 container mx-auto">
            <div className="flex items-start justify-center min-h-screen">
              <div className="mt-20 w-full">
                <LoadingSpinner />
                {children}
              </div>
            </div>
          </main>
          <Footer />
          <SessionManager />
        </body>
      </html>
    </ClerkProvider>
  );
}
