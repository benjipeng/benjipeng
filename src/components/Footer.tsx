import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full flex justify-center bg-background/80 dark:bg-background/40 backdrop-blur-sm shadow-lg">
      <div className="w-full max-w-7xl py-4 px-4 text-center">
        <p className="text-neutral-700 dark:text-neutral-300">
          © {currentYear} Benji Peng
        </p>
      </div>
    </footer>
  );
};

export default Footer;
