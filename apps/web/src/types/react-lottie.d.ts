declare module "react-lottie" {
  import { CSSProperties } from "react";

  interface RendererSettings {
    preserveAspectRatio?: string;
    clearCanvas?: boolean;
    progressiveLoad?: boolean;
    hideOnTransparent?: boolean;
  }

  interface LottieOptions {
    loop?: boolean;
    autoplay?: boolean;
    animationData: object;
    rendererSettings?: RendererSettings;
  }

  interface EventListener {
    eventName: string;
    callback: () => void;
  }

  interface LottieProps {
    options: LottieOptions;
    height?: number | string;
    width?: number | string;
    isStopped?: boolean;
    isPaused?: boolean;
    speed?: number;
    style?: CSSProperties;
    className?: string;
    isClickToPauseDisabled?: boolean;
    ariaRole?: string;
    ariaLabel?: string;
    title?: string;
    eventListeners?: EventListener[];
  }

  export default function Lottie(props: LottieProps): JSX.Element;
}
