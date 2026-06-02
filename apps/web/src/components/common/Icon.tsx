import Icons, { IconNames } from "./Icons";

interface IconProperties {
  className?: string;
  viewBox?: string;
  title?: string;
  style?: never;
  role?: string;
  fill?: string;
  stroke?: string;
  size?:
    | "8"
    | "10"
    | "12"
    | "14"
    | "16"
    | "18"
    | "20"
    | "24"
    | "28"
    | "32"
    | "36"
    | "40"
    | "60";
  name: IconNames;
}

const Icon: React.FC<IconProperties> = ({
  viewBox = "0 0 24 24",
  title,
  size = "16",
  name,
  role,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox={viewBox}
    role={title ? (role ?? "img") : role}
    aria-hidden={title ? undefined : true}
    {...props}
  >
    {title && <title>{title}</title>}
    {Icons[name] ? Icons[name]() : Icons.Brand()}
  </svg>
);

export default Icon;
