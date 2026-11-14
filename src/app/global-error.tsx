"use client";

// Last-resort screen when the root layout itself fails. It replaces the whole
// document, so it carries its own minimal styles instead of the theme.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, -apple-system, 'Hiragino Sans', sans-serif",
          background: "#f6f7fb",
          color: "#161823",
          textAlign: "center",
          padding: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>アプリを読み込めませんでした</h1>
          <p style={{ fontSize: 14, color: "#646b85", marginBottom: 20 }}>学習履歴はこの端末に保存されたままです。</p>
          <button
            type="button"
            onClick={() => (reset ? reset() : window.location.reload())}
            style={{
              minHeight: 44,
              padding: "0 20px",
              borderRadius: 12,
              border: 0,
              background: "#4f46e5",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            再読み込み
          </button>
        </div>
      </body>
    </html>
  );
}
