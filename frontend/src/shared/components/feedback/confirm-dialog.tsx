import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={isConfirming ? undefined : onCancel}
      />
      <div className="relative w-full max-w-md p-6 bg-card border shadow-lg rounded-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-destructive/10 text-destructive rounded-full shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Đang xử lý..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
