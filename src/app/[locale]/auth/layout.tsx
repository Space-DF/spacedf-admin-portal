export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='m-auto flex size-full h-screen flex-col items-center justify-center px-5 md:max-w-xl'>
      {children}
    </div>
  );
}
