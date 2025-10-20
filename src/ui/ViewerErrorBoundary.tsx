import { Component, type ErrorInfo, type ReactNode, type PropsWithChildren } from "react";

type ViewerErrorBoundaryProps = PropsWithChildren<{ fallback: ReactNode }>;

export class ViewerErrorBoundary extends Component<ViewerErrorBoundaryProps> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[viewer] rendering error", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
