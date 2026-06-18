interface CloseIconProps {
  width?: number;
  height?: number;
}

export default function CloseIcon({ width = 20, height = 20 }: CloseIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
