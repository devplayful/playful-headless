import './HomeHero.css';

export function HomePageContent({
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div className="playful-home-page" {...rest}>
      {children}
    </div>
  );
}
