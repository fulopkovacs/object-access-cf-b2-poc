import { useRouter } from "next/router";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NavbarContent,
  NavbarItem,
  Navbar as NextUINavbar,
} from "@nextui-org/react";

type Path = { pathname: string };

function PathSelector({
  paths,
  currentPathname,
}: {
  paths: Path[];
  currentPathname: string;
}) {
  const router = useRouter();
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">{currentPathname}</Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Single selection actions" variant="bordered">
        {paths.map((path) => (
          <DropdownItem
            key={path.pathname}
            variant="flat"
            onClick={() => {
              void router.push({ pathname: path.pathname });
            }}
          >
            {path.pathname}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

export function Navbar() {
  const paths: Path[] = ["/user", "/user/upload", "/", "/test"].map(
    (pathname) => ({
      pathname,
    })
  );
  const router = useRouter();

  return (
    <NextUINavbar>
      <NavbarContent justify="end">
        <NavbarItem>Path</NavbarItem>
        <NavbarItem>
          <PathSelector
            paths={paths}
            currentPathname={router.pathname || "/"}
          />
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
}
