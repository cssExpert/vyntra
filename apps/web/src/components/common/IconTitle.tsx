import {
  cloneElement,
  isValidElement,
  type ComponentType,
  type CSSProperties,
  type ReactElement,
} from "react";
import { cn } from "@/lib/utils";
import { BookOpenText } from "lucide-react";

/**
 * Icon passed from the parent — either a component reference or a ready
 * JSX element:
 *
 *   <IconTitle title="SEO" icon={Globe} />
 *   <IconTitle title="SEO" icon={<Icon name="Logo" />} />
 *
 * Component references receive `iconClassName`; JSX elements get it merged
 * over their own className (so sizing/color stay consistent per usage).
 */
export type TitleIcon =
  | ComponentType<{ className?: string }>
  | ReactElement<{ className?: string }>;

interface IconTitleProps {
  title: string;
  /** Optional sub-text rendered under the title. */
  paragraph?: string;
  /** Defaults to BookOpenText when omitted. */
  icon?: TitleIcon;
  center?: boolean;
  className?: string;
  /** Inline styles from the parent — merged over the defaults */
  style?: CSSProperties;
  titleClassName?: string;
  iconClassName?: string;
  paragraphClassName?: string;
}

function renderIcon(icon: TitleIcon, className: string) {
  if (isValidElement<{ className?: string }>(icon)) {
    return cloneElement(icon, {
      className: cn(icon.props.className, className),
    });
  }
  const IconComponent = icon as ComponentType<{ className?: string }>;
  return <IconComponent className={className} />;
}

const IconTitle = ({
  title,
  paragraph,
  icon = BookOpenText,
  className,
  style,
  center,
  titleClassName,
  iconClassName,
  paragraphClassName,
}: IconTitleProps) => {
  return (
    <div
      className={cn("w-full", center && "mx-auto text-center", className)}
      style={{ ...style }}
    >
      <h3
        className={cn(
          "flex items-center gap-2",
          center && "justify-center",
          titleClassName,
        )}
      >
        {renderIcon(icon, cn("w-4 h-4 text-primary", iconClassName))}
        <span>{title}</span>
      </h3>
      {paragraph && (
        <p
          className={cn(
            "text-muted-foreground text-xs md:text-sm mt-0.5",
            paragraphClassName,
          )}
        >
          {paragraph}
        </p>
      )}
    </div>
  );
};

export default IconTitle;
