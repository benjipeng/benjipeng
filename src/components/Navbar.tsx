import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Switch,
} from "@nextui-org/react";
import { Sun, Moon } from "lucide-react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  const menuItems = ["Home", "About", "Projects", "Contact"];

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-7xl">
        <Navbar
          onMenuOpenChange={setIsMenuOpen}
          className="bg-background/40 dark:bg-background/40 backdrop-blur-sm rounded-full mt-2 shadow-lg"
          classNames={{
            wrapper: "px-2 sm:px-4 max-w-full",
            item: "data-[active=true]:text-primary-500",
          }}
        >
          <NavbarContent className="sm:hidden" justify="start">
            <NavbarMenuToggle
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="text-neutral-700 dark:text-neutral-300 p-6"
            />
          </NavbarContent>

          <NavbarContent className="sm:hidden pr-2" justify="center">
            <NavbarBrand>
              <p className="font-semibold text-neutral-900 dark:text-neutral-200 text-xl">
                You Have Found Me
              </p>
            </NavbarBrand>
          </NavbarContent>

          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarBrand>
              <p className="font-semibold text-neutral-900 dark:text-neutral-200 text-2xl m-4">
                You Have Found Me
              </p>
            </NavbarBrand>
            {menuItems.map((item, index) => (
              <NavbarItem key={`${item}-${index}`}>
                <Link
                  color="foreground"
                  href="#"
                  className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-lg"
                >
                  {item}
                </Link>
              </NavbarItem>
            ))}
          </NavbarContent>

          <NavbarContent justify="end">
            <NavbarItem>
              <Switch
                defaultSelected={isDark}
                size="lg"
                color="secondary"
                startContent={<Sun size={20} />}
                endContent={<Moon size={20} />}
                onValueChange={toggleTheme}
              />
            </NavbarItem>
          </NavbarContent>

          <NavbarMenu className="bg-background/70 dark:bg-background/70 backdrop-blur-md mt-2 pt-2 rounded-2xl">
            {menuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  className="w-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                  href="#"
                  size="lg"
                >
                  {item}
                </Link>
              </NavbarMenuItem>
            ))}
          </NavbarMenu>
        </Navbar>
      </div>
    </div>
  );
}
