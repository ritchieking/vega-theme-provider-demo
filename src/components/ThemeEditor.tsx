import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import type { ThemeParse } from "../validateTheme";
import type { Scheme } from "../tokens";

const extensions = [json(), EditorView.lineWrapping];

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export function ThemeEditor(props: {
  text: string;
  onChange: (t: string) => void;
  parse: ThemeParse;
  rejection: string | null;
  scheme: Scheme;
  dirty: boolean;
}) {
  const { text, onChange, parse, rejection, scheme, dirty } = props;
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  const copy = async () => {
    const ok = await copyText(text);
    setCopied(ok ? "ok" : "fail");
    window.setTimeout(() => setCopied("idle"), 1600);
  };

  return (
    <div className="editor">
      <div className="editor__bar">
        <span className="editor__status" data-state={parse.ok ? "ok" : "error"}>
          {parse.ok ? (dirty ? "Valid, edited" : "Valid") : "Invalid: charts keep the last valid theme"}
        </span>
        <button type="button" className="btn btn--small" onClick={copy} aria-live="polite">
          {copied === "ok" ? "Copied" : copied === "fail" ? "Copy failed" : "Copy theme JSON"}
        </button>
      </div>
      <div className="editor__cm" data-invalid={!parse.ok}>
        <CodeMirror
          value={text}
          height="360px"
          theme={scheme === "dark" ? githubDark : githubLight}
          extensions={extensions}
          onChange={onChange}
          basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: false, autocompletion: false, searchKeymap: false }}
          aria-label="Theme JSON"
        />
      </div>
      {!parse.ok && (
        <div className="editor__error" role="alert">
          <strong>{parse.line ? `Line ${parse.line}, column ${parse.col}` : "Theme error"}</strong>
          <span>{parse.message}</span>
        </div>
      )}
      {parse.ok && rejection && (
        <div className="editor__error editor__error--soft" role="alert">
          <strong>Charts rejected this config</strong>
          <span>{rejection}. Showing the last working theme.</span>
        </div>
      )}
    </div>
  );
}
