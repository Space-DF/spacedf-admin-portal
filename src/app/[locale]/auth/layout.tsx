export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className=' flex w-full h-screen flex-col items-center justify-center px-5 bg-brand-background-fill-surface'>
      {children}
    </div>
  );
}
