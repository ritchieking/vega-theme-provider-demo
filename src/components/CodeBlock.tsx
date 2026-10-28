import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import type { Scheme } from "../tokens";

const extensions = [javascript({ jsx: true, typescript: true }), EditorView.lineWrapping];
const setup = { lineNumbers: false, foldGutter: false, highlightActiveLine: false, highlightActiveLineGutter: false };

/** Read-only, syntax-highlighted TSX. */
export function CodeBlock({ code, scheme, label }: { code: string; scheme: Scheme; label: string }) {
  return (
    <div className="code__body" role="region" aria-label={label}>
      <CodeMirror value={code} theme={scheme === "dark" ? githubDark : githubLight} extensions={extensions} editable={false} basicSetup={setup} />
    </div>
  );
}
