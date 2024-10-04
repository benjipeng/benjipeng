import { forwardRef } from "react";

interface IconComponentProps {
  icon: React.ReactNode;
  className?: string;
}

const IconComponent = forwardRef<HTMLDivElement, IconComponentProps>(
  ({ icon, className = "" }, ref) => {
    return (
      <div ref={ref} className={className}>
        {icon}
      </div>
    );
  }
);

IconComponent.displayName = "IconComponent";
export default IconComponent;
