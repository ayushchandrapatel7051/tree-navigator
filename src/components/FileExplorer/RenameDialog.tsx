import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface RenameDialogProps {
  isOpen: boolean;
  currentName: string;
  onRename: (newName: string) => boolean;
  onClose: () => void;
}

export function RenameDialog({
  isOpen,
  currentName,
  onRename,
  onClose,
}: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError("");
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [isOpen, currentName]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    const success = onRename(name.trim());
    if (!success) {
      setError("Name already exists in this folder");
      return;
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2">
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            placeholder="Enter new name"
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
