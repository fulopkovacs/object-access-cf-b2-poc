import NextLink from "next/link";
import {
  Button,
  NavbarContent,
  NavbarItem,
  Navbar as NextUINavbar,
} from "@nextui-org/react";

export function Navbar() {
  return (
    <NextUINavbar maxWidth="full">
      <NavbarContent justify="end">
        <NavbarItem>
          <Button variant="light" href="/user/images" as={NextLink}>
            View images
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button href="/user/upload" as={NextLink}>
            Upload image
          </Button>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
}
