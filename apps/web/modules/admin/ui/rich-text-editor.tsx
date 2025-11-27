"use client";

import { useState } from "react";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Bold, Italic, List, Heading1, Heading2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [selectedText, setSelectedText] = useState("");

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("rich-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newValue = 
      value.substring(0, start) + 
      prefix + selectedText + suffix + 
      value.substring(end);
    
    onChange(newValue);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newStart = start + prefix.length;
      const newEnd = newStart + selectedText.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertMarkdown("**", "**"),
    },
    {
      icon: Italic,
      label: "Italic", 
      action: () => insertMarkdown("*", "*"),
    },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => insertMarkdown("# "),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => insertMarkdown("## "),
    },
    {
      icon: List,
      label: "List",
      action: () => insertMarkdown("- "),
    },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex gap-1">
        {toolbarButtons.map((button) => (
          <Button
            key={button.label}
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.label}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Editor */}
      <Textarea
        id="rich-editor"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder || "Enter your content here..."}
        className="border-0 resize-none focus-visible:ring-0 min-h-[200px]"
        rows={10}
      />

      {/* Preview Help */}
      <div className="border-t bg-muted/30 p-2 text-xs text-muted-foreground">
        <p>
          Use markdown syntax: **bold**, *italic*, # Heading 1, ## Heading 2, - List item
        </p>
      </div>
    </div>
  );
};