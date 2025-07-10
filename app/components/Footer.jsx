const Footer = () => (
  <footer className="w-full bg-blue-700 text-white py-4 mt-8 shadow-inner">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
      <div className="text-sm">
        &copy; {new Date().getFullYear()} Clerk App. All rights reserved.
      </div>
      <div className="text-sm mt-2 md:mt-0">
        Built with{" "}
        <a
          href="https://clerk.com"
          className="underline hover:text-blue-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          Clerk
        </a>{" "}
        &amp; Next.js
      </div>
    </div>
  </footer>
);

export default Footer;
