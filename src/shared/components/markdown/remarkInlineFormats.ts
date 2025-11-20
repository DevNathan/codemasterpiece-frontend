import type { Plugin } from "unified";
import type { Root, Text, PhrasingContent, Parent } from "mdast";
import { visit } from "unist-util-visit";

const remarkInlineFormats: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      const value = (node as Text).value;
      if (!value || (!value.includes("++") && !value.includes("=="))) return;

      const parts: PhrasingContent[] = [];
      const regex = /(\+\+([^+]+)\+\+|==([^=]+)==)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(value))) {
        const [full, , underlineText, markText] = match;
        const start = match.index;

        // 앞쪽 일반 텍스트
        if (start > lastIndex) {
          parts.push({
            type: "text",
            value: value.slice(lastIndex, start),
          });
        }

        if (underlineText != null) {
          // ++밑줄++
          parts.push({
            type: "underline" as any,
            data: { hName: "u" },
            children: [
              {
                type: "text",
                value: underlineText,
              },
            ],
          } as any);
        } else if (markText != null) {
          // ==하이라이트==
          parts.push({
            type: "mark" as any,
            data: { hName: "mark" },
            children: [
              {
                type: "text",
                value: markText,
              },
            ],
          } as any);
        }

        lastIndex = start + full.length;
      }

      if (parts.length === 0) return;

      // 남은 꼬리 텍스트
      if (lastIndex < value.length) {
        parts.push({
          type: "text",
          value: value.slice(lastIndex),
        });
      }

      (parent as Parent).children.splice(index, 1, ...parts);
      return index + parts.length;
    });
  };
};

export default remarkInlineFormats;
