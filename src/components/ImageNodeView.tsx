"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Trash2 } from "lucide-react";

export function ImageNodeView({ node, deleteNode, selected }: ReactNodeViewProps) {
  const { src, alt } = node.attrs as { src: string; alt?: string };

  return (
    <NodeViewWrapper className="img-nodeview relative group my-6 block w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ""}
        draggable={false}
        className={`block w-full h-auto rounded-xl ${
          selected ? "outline outline-2 outline-offset-2 outline-[#076292]" : ""
        }`}
      />

      {/* Hover delete button — sits above the editor layer */}
      <button
        type="button"
        contentEditable={false}
        onMouseDown={(e) => {
          // prevent ProseMirror from stealing the click / moving selection
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteNode();
        }}
        title="Delete image"
        className="absolute top-2.5 right-2.5 z-20 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/95 text-red-600 shadow-md ring-1 ring-black/5 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-150"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </NodeViewWrapper>
  );
}
