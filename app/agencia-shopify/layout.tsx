import ShopifyDeferredCss from '@/components/ShopifyDeferredCss';

export default function AgenciaShopifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ShopifyDeferredCss />
      {children}
    </>
  );
}
