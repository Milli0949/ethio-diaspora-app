import React, { useState } from "react";

const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || "Teklemillen0@gmail.com";
const SUPPORT_TELEGRAM = import.meta.env.VITE_SUPPORT_TELEGRAM || "@tekii18";
const PAYMENT_URL = import.meta.env.VITE_PAYMENT_CHECKOUT_URL || "#payment";
const DOWNLOAD_URL = import.meta.env.VITE_APP_DOWNLOAD_URL || "#download";

export function App() {
  const [lang, setLang] = useState<"am" | "en">("am");
  const [dark, setDark] = useState<boolean>(true);
  const [tab, setTab] = useState<"info" | "download" | "help">("info");

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
    backgroundColor: dark ? "#0b1120" : "#f1f5f9",
    color: dark ? "#f8fafc" : "#0f172a",
    paddingBottom: "48px",
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: dark ? "#111827" : "#ffffff",
    borderBottom: dark ? "1px solid #1f2937" : "1px solid #e2e8f0",
    padding: "16px",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "780px",
    margin: "0 auto",
  };

  const cardStyle: React.CSSProperties = {
    margin: "20px 16px 0",
    backgroundColor: dark ? "#111827" : "#ffffff",
    border: dark ? "1px solid #1f2937" : "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
  };

  const boxStyle: React.CSSProperties = {
    marginTop: "14px",
    backgroundColor: dark ? "#090d16" : "#f8fafc",
    border: dark ? "1px solid #1e293b" : "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px",
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "9px 15px",
    borderRadius: "10px",
    border: "none",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    backgroundColor: active ? "#f59e0b" : dark ? "#1f2937" : "#e2e8f0",
    color: active ? "#090d16" : dark ? "#e2e8f0" : "#1e293b",
  });

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div style={containerStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "999px", backgroundColor: "rgba(245, 158, 11, 0.18)", color: "#fbbf24", marginBottom: "6px" }}>
                {lang === "am" ? "ኦፊሴላዊ የመረጃ እና የማውረጃ ገጽ" : "OFFICIAL INFO & DOWNLOAD PORTAL"}
              </div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>
                {lang === "am" ? "የግንኙነት እና የትብብር መድረክ" : "Connection & Partnership Portal"}
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: dark ? "#94a3b8" : "#475569" }}>
                {lang === "am"
                  ? "በኢትዮጵያ እና በውጭ ያሉ ዲያፖራዎችን በመከባበር የሚያገናኝ መድረክ"
                  : "Connecting Ethiopians at home and diaspora in mutual respect"}
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setLang(lang === "am" ? "en" : "am")}
                style={{ padding: "7px 12px", borderRadius: "10px", border: "1px solid #f59e0b", backgroundColor: "rgba(245, 158, 11, 0.16)", color: "#fbbf24", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                {lang === "am" ? "English" : "አማርኛ"}
              </button>
              <button
                onClick={() => setDark(!dark)}
                style={{ padding: "7px 12px", borderRadius: "10px", border: dark ? "1px solid #374151" : "1px solid #cbd5e1", backgroundColor: "transparent", color: "inherit", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                {dark ? (lang === "am" ? "ብርሃን" : "Light") : (lang === "am" ? "ጨለማ" : "Dark")}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
            <button style={tabBtn(tab === "info")} onClick={() => setTab("info")}>
              {lang === "am" ? "መረጃ" : "Info"}
            </button>
            <button style={tabBtn(tab === "download")} onClick={() => setTab("download")}>
              {lang === "am" ? "አፑን አውርድ" : "Download"}
            </button>
            <button style={tabBtn(tab === "help")} onClick={() => setTab("help")}>
              {lang === "am" ? "እገዛ" : "Help"}
            </button>
          </div>
        </div>
      </header>

      <main style={containerStyle}>
        {tab === "info" && (
          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 800 }}>
              {lang === "am" ? "ስለ መድረኩ እና ዓላማው" : "About the Platform & Purpose"}
            </h2>
            <p style={{ margin: 0, fontSize: "14.5px", lineHeight: 1.65 }}>
              {lang === "am"
                ? "ይህ መድረክ በትክክለኛ ሐሳብና በመልካም ዓላማ በውጭ የሚኖሩ ዲያፖራዎችን እና በኢትዮጵያ የሚገኙ ኢትዮጵያውያንን በጋራ ለመተዋወቅ፣ ሐሳብ ለመለዋወጥ እና የሕይወት አጋርነትንና የወደፊት እድገትን በመደጋገፍ ለመገንባት የተዘጋጀ ነው። አላማው በመከባበር፣ በታማኝነት እና በጋራ እድገት ላይ የተመሠረተ ጠንካራ ግንኙነት እንዲፈጠር ማገዝ ነው።"
                : "This platform brings together diaspora members abroad and Ethiopians at home with genuine intentions—encouraging meaningful connection, building life partnerships, and supporting shared growth and opportunities with mutual respect."}
            </p>
            <div style={boxStyle}>
              <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#fbbf24", marginBottom: "6px" }}>
                {lang === "am" ? "የደህንነት እና የአጠቃቀም መርህ" : "Safety & Usage Principles"}
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", lineHeight: 1.6, color: dark ? "#cbd5e1" : "#334155" }}>
                <li>{lang === "am" ? "ይህ ድረ-ገጽ ለመግቢያ (Login) ወይም ለመመዝገቢያ አይደለም፤ ዋናው አገልግሎት በመተግበሪያው (App) ውስጥ ይከናወናል።" : "This portal does not host login or registration forms; core features operate inside the app."}</li>
                <li>{lang === "am" ? "ተጠቃሚዎች እርስ በርስ በአክብሮት እንዲግባቡ እና የግል ደህንነታቸውን እንዲጠብቁ ይመከራሉ።" : "Users are encouraged to communicate respectfully and protect personal information."}</li>
              </ul>
            </div>
          </section>
        )}

        {tab === "download" && (
          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 800 }}>
              {lang === "am" ? "አፑን አውርድ እና ክፍያ" : "App Download & Payment"}
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: "14.5px", lineHeight: 1.65 }}>
              {lang === "am"
                ? "መተግበሪያውን ለማውረድ እና በቴሌብር (Telebirr) አማካኝነት የስልክ ቁጥርዎን በቀጥታ ሳያስገቡ ክፍያ ለመፈጸም ከታች ያሉትን አማራጮች ይጠቀሙ።"
                : "Download the app and complete payment via Telebirr without entering your phone number directly on the web interface."}
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", backgroundColor: "#f59e0b", color: "#090d16", fontWeight: 800, fontSize: "13.5px", padding: "11px 18px", borderRadius: "11px" }}>
                {lang === "am" ? "አፑን አውርድ (Download APK)" : "Download App (APK)"}
              </a>
              <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", backgroundColor: "rgba(16, 185, 129, 0.16)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.45)", fontWeight: 700, fontSize: "13.5px", padding: "11px 18px", borderRadius: "11px" }}>
                {lang === "am" ? "በቴሌብር ክፍያ ሊንክ ይክፈሉ" : "Pay via Telebirr Link"}
              </a>
            </div>
            <div style={boxStyle}>
              <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#fbbf24", marginBottom: "6px" }}>
                {lang === "am" ? "በቴሌብር ቀጥታ ክፍያ እንዴት ይሰራል?" : "How direct Telebirr payment works"}
              </div>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: dark ? "#cbd5e1" : "#334155" }}>
                {lang === "am"
                  ? "በድረ-ገጹ ላይ የስልክ ቁጥርዎን ማስገባት ሳያስፈልግዎ የክፍያ ሊንኩን በመክፈት ወይም ድጋፍን በማነጋገር በቴሌብር ክፍያዎን ማረጋገጥ ይችላሉ።"
                  : "Instead of typing your phone number into this site, open the payment checkout link or contact support to complete and confirm your Telebirr payment."}
              </p>
            </div>
          </section>
        )}

        {tab === "help" && (
          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 800 }}>
              {lang === "am" ? "እገዛ እና ቀጥተኛ ግንኙነት" : "Help & Direct Support"}
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: "14.5px", lineHeight: 1.65 }}>
              {lang === "am"
                ? "ማንኛውም ጥያቄ፣ የክፍያ ማረጋገጫ ወይም የአፕ ድጋፍ ቢፈልጉ በቀጥታ ከዚህ በታች ባሉት አድራሻዎች ያግኙን፦"
                : "For questions, payment confirmation, or assistance, reach out directly:"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px" }}>
              <div style={boxStyle}>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>{lang === "am" ? "ኢሜይል (Email)" : "Email"}</div>
                <a href={`mailto:${OWNER_EMAIL}`} style={{ color: "#fbbf24", fontWeight: 700, fontSize: "13.5px", textDecoration: "none", wordBreak: "break-all" }}>
                  {OWNER_EMAIL}
                </a>
              </div>
              <div style={boxStyle}>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>{lang === "am" ? "ቴሌግራም (Telegram)" : "Telegram"}</div>
                <a href={`https://t.me/${SUPPORT_TELEGRAM.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#fbbf24", fontWeight: 700, fontSize: "13.5px", textDecoration: "none" }}>
                  {SUPPORT_TELEGRAM}
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer style={{ marginTop: "32px", textAlign: "center", fontSize: "12px", color: "#94a3b8", padding: "0 16px" }}>
        {lang === "am" ? `መብቱ በሕግ የተጠበቀ ነው • ${OWNER_EMAIL} • ${SUPPORT_TELEGRAM}` : `All rights reserved • ${OWNER_EMAIL} • ${SUPPORT_TELEGRAM}`}
      </footer>
    </div>
  );
}

export default App;
