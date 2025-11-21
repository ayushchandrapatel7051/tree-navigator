import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function UndoToast({
  message,
  onUndo,
  onDismiss,
  duration = 5000,
}: UndoToastProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration, onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
      <div className="bg-popover border border-border rounded-[14px] shadow-lg px-4 py-3 flex items-center gap-4 min-w-[320px]">
        <p className="text-sm flex-1">{message}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onUndo();
            onDismiss();
          }}
          className="gap-2"
        >
          <Undo2 className="w-4 h-4" />
          Undo
        </Button>
      </div>
    </div>
  );
}
