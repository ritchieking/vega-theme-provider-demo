/** Every external URL used by the demo lives here. */

export const LINKS = {
  /** The fork branch that contains VegaThemeProvider. */
  fork: "https://github.com/ritchieking/react-vega/tree/theme-provider",
  /** The published prerelease on npm. */
  npm: "https://www.npmjs.com/package/@ritchieking/react-vega",
  /** Upstream react-vega repository. */
  upstream: "https://github.com/vega/react-vega",
  /**
   * TODO: PLACEHOLDER. The upstream pull request does not exist yet.
   * Set this to the PR URL (e.g. "https://github.com/vega/react-vega/pull/123")
   * and the header link will switch from a "PR pending" label to a real link.
   */
  upstreamPr: "" as string,
  /** Docs for the config object the themes are built from. */
  vegaLiteConfig: "https://vega.github.io/vega-lite/docs/config.html",
} as const;

export const hasUpstreamPr = LINKS.upstreamPr.trim().length > 0;
