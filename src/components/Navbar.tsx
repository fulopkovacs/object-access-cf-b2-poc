import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "~/utils/cn";

type Path = { pathname: string };

export function Navbar() {
  const paths: Path[] = ["/user", "/user/upload"].map((pathname) => ({
    pathname,
  }));
  const router = useRouter();

  return (
    <nav
      className="group sticky top-0 flex gap-3 text-gray11"
      // data-pathname={router.pathname}
      data-hello={router.pathname}
    >
      {paths.map(({ pathname }) => (
        <Link
          key={pathname}
          href={pathname}
          className={cn(
            "underline hover:text-gray12",
            router.pathname === pathname && "text-yellow9"
          )}
        >
          {pathname}
        </Link>
      ))}
    </nav>
  );
}
