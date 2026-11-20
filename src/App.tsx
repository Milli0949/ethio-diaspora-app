import React, { useState } from "react";

const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || "Teklemillen0@gmail.com";
const SUPPORT_TELEGRAM = import.meta.env.VITE_SUPPORT_TELEGRAM || "@tekii18";
const PAYMENT_URL = import.meta.env.VITE_PAYMENT_CHECKOUT_URL || "#payment";
const DOWNLOAD_URL = import.meta.env.VITE_APP_DOWNLOAD_URL || "#download";

export function App() {
  const [lang, setLang] = useState<"am" | "en">("am");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"info" | "download" | "help">("info");

  const bg = darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const card = darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted = darkMode ? "text-slate-400" : "text-slate-600";

  return (
    <div className={`min-h-screen ${bg} transition-colors`}>
      <header className={`border-b ${darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white/80"} backdrop-blur sticky top-0 z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              {lang === "am" ? "የግንኙነት እና የትብብር መድረክ" : "Connection & Partnership Portal"}
            </h1>
            <p className={`text-xs ${muted}`}>
              {lang === "am"
                ? "በኢትዮጵያ እና በውጭ ያሉ ዲያፖራዎችን በአክብሮት የሚያገናኝ መድረክ"
                : "Connecting Ethiopians at home and diaspora in mutual respect"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "am" ? "en" : "am")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/40 bg-amber-500/10 text-amber-400"
            >
              {lang === "am" ? "English" : "አማርኛ"}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700"
            >
              {darkMode ? (lang === "am" ? "ብርሃን" : "Light") : (lang === "am" ? "ጨለማ" : "Dark")}
            </button>
          </div>
        </div>

        <nav className="max-w-4xl mx-auto px-4 flex gap-2 pb-2">
          {(["info", "download", "help"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                activeTab === tab
                  ? "bg-amber-500 text-slate-950"
                  : darkMode
                  ? "bg-slate-800/70 text-slate-300"
                  : "bg-slate-200/70 text-slate-700"
              }`}
            >
              {tab === "info" && (lang === "am" ? "መረጃ" : "Info")}
              {tab === "download" && (lang === "am" ? "አፑን አውርድ" : "Download")}
              {tab === "help" && (lang === "am" ? "እገዛ" : "Help")}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {activeTab === "info" && (
          <section className={`rounded-2xl border p-6 space-y-4 ${card}`}>
            <h2 className="text-xl font-semibold">
              {lang === "am"
                ? "ስለ መድረኩ እና ዓላማው"
                : "About the Platform & Purpose"}
            </h2>
            <p className="leading-relaxed">
              {lang === "am"
                ? "ይህ መድረክ በትክክለኛ ሐሳብና በመልካም ዓላማ በውጭ የሚኖሩ ዲያፖራዎችን እና በኢትዮጵያ የሚገኙ ኢትዮጵያውያንን በጋራ ለመተዋወቅ፣ ሐሳብ ለመለዋወጥ እና የሕይወት አጋርነትንና የወደፊት እድገትን በመደጋገፍ ለመገንባት የተዘጋጀ ነው። አላማው በመከባበር፣ በታማኝነት እና በጋራ እድገት ላይ የተመሠረተ ጠንካራ ግንኙነት እንዲፈጠር ማገዝ ነው።"
                : "This platform is designed to bring together diaspora members abroad and Ethiopians at home with genuine intentions—encouraging meaningful connection, building life partnerships, and supporting shared growth and opportunities with mutual respect."}
            </p>
            <div className={`rounded-xl p-4 border ${darkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <h3 className="font-semibold text-sm mb-2 text-amber-400">
                {lang === "am" ? "የደህንነት እና የግል ጥበቃ መርህ" : "Safety & Privacy Principles"}
              </h3>
              <ul className={`list-disc list-inside space-y-1.5 text-sm ${muted}`}>
                <li>
                  {lang === "am"
                    ? "ይህ ድረ-ገጽ ለመግቢያ (Login) ወይም ለመመዝገቢያ አይደለም፤ ዋናው አገልግሎት በመተግበሪያው (App) ውስጥ ይከናወናል።"
                    : "This web portal does not host login or registration forms; core features operate inside the mobile application."}
                </li>
                <li>
                  {lang === "am"
                    ? "ተጠቃሚዎች እርስ በርስ በአክብሮት እንዲግባቡ እና የግል ደህንነታቸውን እንዲጠብቁ ይመከራሉ።"
                    : "Users are encouraged to communicate respectfully and safeguard personal information at all times."}
                </li>
              </ul>
            </div>
          </section>
        )}

        {activeTab === "download" && (
          <section className={`rounded-2xl border p-6 space-y-5 ${card}`}>
            <div>
              <h2 className="text-xl font-semibold">
                {lang === "am" ? "አፑን አውርድ እና ክፍያ" : "App Download & Payment"}
              </h2>
              <p className={`text-sm mt-1 ${muted}`}>
                {lang === "am"
                  ? "መተግበሪያውን ለማውረድ እና በቴሌብር (Telebirr) አማካኝነት የስልክ ቁጥርዎን በቀጥታ ሳያስገቡ ክፍያ ለመፈጸም ከታች ያሉትን አማራጮች ይጠቀሙ።"
                  : "Use the options below to download the app and complete payment via Telebirr without entering your phone number directly on the web form."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
              >
                {lang === "am" ? "አፑን አውርድ (Download APK)" : "Download App (APK)"}
              </a>
              <a
                href={PAYMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl font-semibold border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition"
              >
                {lang === "am" ? "በቴሌብር ክፍያ ሊንክ ይክፈሉ" : "Pay via Telebirr Link"}
              </a>
            </div>

            <div className={`rounded-xl p-4 border text-sm space-y-2 ${darkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <p className="font-medium">
                {lang === "am" ? "በቴሌብር ቀጥታ ክፍያ እንዴት ይሰራል?" : "How direct Telebirr payment works"}
              </p>
              <p className={muted}>
                {lang === "am"
                  ? "በድረ-ገጹ ላይ የስልክ ቁጥርዎን ማስገባት ሳያስፈልግዎ የክፍያ ሊንኩን በመክፈት ወይም ድጋፍን በማነጋገር በቴሌብር ክፍያዎን ማረጋገጥ ይችላሉ።"
                  : "Instead of typing your phone number into this site, open the payment checkout link or reach out to support to complete and confirm your Telebirr payment."}
              </p>
            </div>
          </section>
        )}

        {activeTab === "help" && (
          <section className={`rounded-2xl border p-6 space-y-4 ${card}`}>
            <h2 className="text-xl font-semibold">
              {lang === "am" ? "እገዛ እና ቀጥተኛ ግንኙነት" : "Help & Direct Support"}
            </h2>
            <p className={`text-sm ${muted}`}>
              {lang === "am"
                ? "ማንኛውም ጥያቄ፣ የክፍያ ማረጋገጫ ወይም የአፕ ድጋፍ ቢፈልጉ በቀጥታ ከዚህ በታች ባሉት አድራሻዎች ያግኙን፦"
                : "For questions, payment confirmation, or assistance, reach out directly through the channels below:"}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className={`p-4 rounded-xl border ${darkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <div className={muted}>{lang === "am" ? "ኢሜይል (Email)" : "Email"}</div>
                <a href={`mailto:${OWNER_EMAIL}`} className="font-semibold text-amber-400 break-all">
                  {OWNER_EMAIL}
                </a>
              </div>
              <div className={`p-4 rounded-xl border ${darkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <div className={muted}>{lang === "am" ? "ቴሌግራም (Telegram)" : "Telegram"}</div>
                <a
                  href={`https://t.me/${SUPPORT_TELEGRAM.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-amber-400"
                >
                  {SUPPORT_TELEGRAM}
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className={`border-t mt-12 py-5 text-center text-xs ${darkMode ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"}`}>
        {lang === "am"
          ? `መብቱ በሕግ የተጠበቀ ነው • ${OWNER_EMAIL} • ${SUPPORT_TELEGRAM}`
          : `All rights reserved • ${OWNER_EMAIL} • ${SUPPORT_TELEGRAM}`}
      </footer>
    </div>
  );
}

export default App;
