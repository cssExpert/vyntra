
import dynamic from "next/dynamic";

const UploadView = dynamic(() =>
  import("@/modules/cms/themes/upload/UploadView").then((m) => ({ default: m.UploadView }))
);
export default function ThemeUploadPage() {
  return <UploadView />;
}
