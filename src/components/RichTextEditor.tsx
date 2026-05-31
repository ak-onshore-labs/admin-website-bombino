"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { ImageNodeView } from "./ImageNodeView";
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Undo, Redo, Link, Minus, RemoveFormatting,
  ImagePlus, Loader2, Trash2,
} from "lucide-react";

interface RichTextEditorProps {
  defaultContent?: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ defaultContent = "", onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageNodeView);
        },
      }).configure({
        inline: false,
        HTMLAttributes: { class: "blog-img" },
      }),
    ],
    content: defaultContent,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "blog-preview focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  function setLink() {
    const prev = editor!.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL:", prev);
    if (url === null) return;
    if (url === "") {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }

  async function handleImageFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }
      const { url } = await res.json();
      editor!.chain().focus().setImage({ src: url }).run();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    e.target.value = ""; // allow re-selecting same file
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">

        {/* Text style */}
        <ToolBtn title="Bold (Ctrl+B)" active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Headings */}
        <ToolBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn title="Bullet List" active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Numbered List" active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Link */}
        <ToolBtn title="Link" active={editor.isActive("link")} onClick={setLink}>
          <Link className="w-3.5 h-3.5" />
        </ToolBtn>

        {/* Image upload */}
        <ToolBtn title="Insert image" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <ImagePlus className="w-3.5 h-3.5" />}
        </ToolBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={onPickImage}
        />

        {/* Delete selected image — only when an image is selected */}
        {editor.isActive("image") && (
          <ToolBtn title="Delete image" danger
            onClick={() => editor.chain().focus().deleteSelection().run()}>
            <Trash2 className="w-3.5 h-3.5" />
          </ToolBtn>
        )}

        {/* HR */}
        <ToolBtn title="Divider line"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>

        {/* Clear */}
        <ToolBtn title="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <RemoveFormatting className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Undo / Redo */}
        <ToolBtn title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* ── Editor ──────────────────────────────────────────── */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */

function Sep() {
  return <div className="w-px h-4 bg-slate-200 mx-0.5" />;
}

function ToolBtn({
  children, onClick, active, title, disabled, danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        danger
          ? "text-red-500 hover:text-white hover:bg-red-500"
          : active
          ? "bg-[#076292] text-white"
          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
