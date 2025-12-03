import { cn } from "@workspace/ui/lib/utils";
import "../../../../styles/widget-header.css";

export const WidgetHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <header 
      data-gradient="true"
      className={cn(
        "mom-gradient-header px-5 py-4 rounded-t-xl",
        className,
      )}
      style={{
        background: 'linear-gradient(180deg, #0F3A7A 0%, #0A2558 100%)',
        backgroundImage: 'linear-gradient(180deg, #0F3A7A 0%, #0A2558 100%)',
        color: 'white',
        '--gradient-from': '#0F3A7A',
        '--gradient-to': '#0A2558'
      } as React.CSSProperties}
    >
      {children}
    </header>
  );
};
