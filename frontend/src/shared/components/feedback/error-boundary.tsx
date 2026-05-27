import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component } from "react";

import { Button } from "@/shared/ui/button";

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application error boundary caught an error", error, errorInfo);
  }

  private readonly handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="surface-panel max-w-lg space-y-5 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Ứng dụng gặp lỗi</h1>
              <p className="text-sm text-muted-foreground">
                MedCare Portal đã chặn lỗi để bảo toàn phiên làm việc. Bạn có thể
                tải lại trang để thử tiếp tục.
              </p>
            </div>
            <Button className="w-full" onClick={this.handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Tải lại ứng dụng
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
