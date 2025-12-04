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
        "mom-gradient-header px-5 py-4 rounded-t-xl text-white",
        className,
      )}
      style={{
        background: 'linear-gradient(180deg, #3b82f6 0%, #0b63f3 100%)',
        backgroundImage: 'linear-gradient(180deg, #3b82f6 0%, #0b63f3 100%)',
        color: 'white'
      }}
    >
      {children}
    </header>
  );
};
