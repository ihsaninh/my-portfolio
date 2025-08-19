import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

function Pre(props: ComponentProps<"pre">) {
  return (
    <div className="code-block group relative">
      <button
        type="button"
        className="code-copy-btn"
        data-copy-code
        aria-label="Copy code"
      >
        <span className="state-default">Copy</span>
        <span className="state-copied">Copied!</span>
      </button>
      <pre {...props} />
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  pre: Pre,
};

export function getMDXComponents(): MDXComponents {
  return mdxComponents;
}
