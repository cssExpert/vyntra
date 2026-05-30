import { cn } from "@/lib/utils"; // Or your project's class-merging utility

const SectionTitle = ({
  title,
  paragraph,
  width = "600px",
  center,
  className,
  mb = "20px",
}: {
  title: string;
  paragraph: string;
  width?: string;
  center?: boolean;
  mb?: string;
  className?: string;
}) => {
  return (
    <>
      <div
        className={cn("w-full", center && "mx-auto text-center", className)}
        style={{ maxWidth: width, marginBottom: mb }}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm md:text-md mt-0.5">
          {paragraph}
        </p>
      </div>
    </>
  );
};

export default SectionTitle;
