import { useRouter } from "next/router";
import Link from "next/link";
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

function PathSelector({ paths }: { paths: Path[] }) {
  const router = useRouter();
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">Select path</Button>
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
            <Link href={path.pathname}>{path.pathname}</Link>
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

  return (
    <NextUINavbar maxWidth="full">
      <NavbarContent justify="end">
        <NavbarItem>Path</NavbarItem>
        <NavbarItem>
        paths
        {
        // <PathSelector paths={paths} />
        }
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
}
