import Link from "next/link";

type BreadcrumbItem = {
  name: string;
  href?: string;
  status: "link" | "disabled" | "active";
};

export default function Breadcrumbs({ paths }: { paths: BreadcrumbItem[] }) {
  return (
    <nav className="text-sm text-gray-400 mb-4">
      {paths.map((item, index) => (
        <span key={index}>
          {item.status === "disabled" || !item.href ? (
            <span className="text-gray-500 font-bold">
              {item.name}
            </span>
          ) : (
            <Link href={item.href} className="hover:text-white">
              {item.name}
            </Link>
          )}
          {index < paths.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}
