/**
 * Renders a form separator. With a label the text sits centered between two
 * lines (the "Or Continue with" divider); without one it's a plain rule.
 * Line and text colours are optional and fall back to the theme.
 */
export function FormSeparator({
  label,
  lineColor,
  textColor,
}: {
  label?: string;
  lineColor?: string;
  textColor?: string;
}) {
  const text = label?.trim();
  const lineStyle = lineColor ? { backgroundColor: lineColor } : undefined;

  if (!text) {
    return lineColor ? (
      <div className="h-px w-full" style={{ backgroundColor: lineColor }} />
    ) : (
      <hr className="border-0 border-t border-border" />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" style={lineStyle} />
      <span
        className="shrink-0 text-sm font-medium text-muted-foreground"
        style={textColor ? { color: textColor } : undefined}
      >
        {text}
      </span>
      <span className="h-px flex-1 bg-border" style={lineStyle} />
    </div>
  );
}
