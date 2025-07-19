import Link from "next/link";

type BreadcrumbItem = {
  name: string;
  href: string;
};

export default function Breadcrumbs({ paths }: { paths: BreadcrumbItem[] }) {
  return (
    <nav className="text-sm text-gray-400 mb-4">
      {paths.map((item, index) => (
        <span key={index}>
          <Link href={item.href} className="hover:text-white">
            {item.name}
          </Link>
          {index < paths.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}
