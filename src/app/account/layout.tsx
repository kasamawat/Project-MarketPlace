import AccountFrame from "@/components/account/AccountFrame";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return <AccountFrame>{children}</AccountFrame>;
}
