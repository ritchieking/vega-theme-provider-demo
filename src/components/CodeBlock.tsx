import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import type { Scheme } from "../tokens";

const tsx = [javascript({ jsx: true, typescript: true })];
const setup = { lineNumbers: false, foldGutter: false, highlightActiveLine: false, highlightActiveLineGutter: false };

/**
 * Read-only code. TSX is syntax-highlighted; "shell" is shown as plain text.
 * Long lines scroll inside the block rather than wrapping.
 */
export function CodeBlock({ code, scheme, label, language = "tsx" }: { code: string; scheme: Scheme; label: string; language?: "tsx" | "shell" }) {
  if (language === "shell") {
    return (
      <div className="code__body" role="region" aria-label={label}>
        <pre className="code__plain">
          <code>{code}</code>
        </pre>
      </div>
    );
  }
  return (
    <div className="code__body" role="region" aria-label={label}>
      <CodeMirror value={code} theme={scheme === "dark" ? githubDark : githubLight} extensions={tsx} editable={false} basicSetup={setup} />
    </div>
  );
}
