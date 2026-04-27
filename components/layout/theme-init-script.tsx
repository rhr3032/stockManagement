export function ThemeInitScript() {
  const script = `(() => {
    try {
      const raw = localStorage.getItem("pos-storage-v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const darkMode = parsed?.state?.settings?.darkMode;
      if (darkMode) {
        document.documentElement.classList.add("dark");
      }
    } catch {}
  })();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
