import React, { useState } from "react";
import { loadLiveControls, loadPrivacySettings, saveLiveControls, savePrivacySettings, type ChatBackgroundPreset, type LiveAppControls, type ThemeMode, type UserPrivacySettings } from "./appIntegration";

const DOWNLOAD_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_APP_DOWNLOAD_URL || "#download";

export default function App() {
  const [lang, setLang] = useState<"am" | "en">("am");
  const [activeTab, setActiveTab] = useState<"info" | "download" | "help">("info");
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings>(() => loadPrivacySettings());
  const [liveControls, setLiveControls] = useState<LiveAppControls>(() => loadLiveControls());

  const updatePrivacy = (next: UserPrivacySettings) => {
    setPrivacySettings(next);
    savePrivacySettings(next);
  };

  const updateControls = (next: LiveAppControls) => {
    setLiveControls(next);
    saveLiveControls(next);
  };

  return (
    <main className={"portal-shell theme-" + privacySettings.themeMode + " bg-" + privacySettings.chatBackground}>
      <header className="portal-header">
        <div>
          <h1>{lang === "am" ? "ፍቅር በነፃ — የሞባይል መተግበሪያ መረጃ" : "Feqer BeNesa — Official App Portal"}</h1>
          <p>
            {lang === "am"
              ? "መተግበሪያውን በቀጥታ በስልክ አፕ ብቻ ይጠቀሙ። ይህ ድረ-ገጽ ለመግቢያ (Login) ወይም ለመመዝገቢያ አይደለም።"
              : "Use the service exclusively inside the mobile app. This website does not provide login or account creation."}
          </p>
        </div>
        <div className="portal-actions">
          <button type="button" onClick={() => setLang(lang === "am" ? "en" : "am")}>
            {lang === "am" ? "English" : "አማርኛ"}
          </button>
        </div>
      </header>

      <nav className="portal-nav" aria-label="App Sections">
        <button type="button" onClick={() => setActiveTab("info")}>
          {lang === "am" ? "ስለ አፑ ዝርዝር" : "About the App"}
        </button>
        <button type="button" onClick={() => setActiveTab("download")}>
          {lang === "am" ? "አፑን አውርድ (Download)" : "Download App"}
        </button>
        <button type="button" onClick={() => setActiveTab("help")}>
          {lang === "am" ? "እገዛ እና መመሪያ (Help)" : "Help & Guide"}
        </button>
      </nav>

      {activeTab === "info" && (
        <section className="data-card">
          <h2>{lang === "am" ? "የመተግበሪያው ዋና ባህሪያት" : "Key App Features"}</h2>
          <ul>
            <li>{lang === "am" ? "ሁለት ቋንቋ (አማርኛ እና እንግሊዝኛ) ድጋፍ" : "Bilingual Amharic & English experience"}</li>
            <li>{lang === "am" ? "በሞባይል አፕ ውስጥ ብቻ የሚሠራ የደህንነት ጥበቃ" : "In-app security & privacy protections"}</li>
            <li>{lang === "am" ? "የመልዕክት ገደብ፣ የ VIP ህጎች፣ እና የሰብስክሪፕሽን አማራጮች" : "Message limits, VIP rules, and subscription plans"}</li>
          </ul>
        </section>
      )}

      {activeTab === "download" && (
        <section id="download" className="data-card">
          <h2>{lang === "am" ? "አፑን ያውርዱ" : "Download the App"}</h2>
          <p>
            {lang === "am"
              ? "አፑ በ Play Store ላይ ስለማይጫን ከታች ባለው ቀጥታ ማውረጃ አገናኝ ያውርዱና በስልክዎ ይጫኑ።"
              : "Since this app is distributed outside Play Store, download and install it directly on your phone."}
          </p>
          <a className="button-primary" href={DOWNLOAD_URL} target="_blank" rel="noreferrer">
            {lang === "am" ? "አፕ ማውረጃ (Download APK / App)" : "Download App"}
          </a>
        </section>
      )}

      {activeTab === "help" && (
        <section className="data-card">
          <h2>{lang === "am" ? "እገዛ እና ተደጋጋሚ ጥያቄዎች" : "Help & FAQ"}</h2>
          <p>
            {lang === "am"
              ? "1. በድረ-ገጹ ላይ መግባት (Login) ወይም አካውንት መፍጠር የለም። 2. ሁሉም አገልግሎቶች በወረደው አፕ ውስጥ ብቻ ይከናወናሉ።"
              : "1. There is no login or registration on this website. 2. All account actions happen inside the installed app."}
          </p>
        </section>
      )}

      <section className="data-card">
        <h3>{lang === "am" ? "የገጽታ እና ዳራ ምርጫ" : "Appearance Preferences"}</h3>
        <div className="form-grid">
          <label>
            {lang === "am" ? "ገጽታ (Theme)" : "Theme"}
            <select
              value={privacySettings.themeMode}
              onChange={(e) => updatePrivacy({ ...privacySettings, themeMode: e.target.value as ThemeMode })}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <label>
            {lang === "am" ? "ዳራ (Background)" : "Background"}
            <select
              value={privacySettings.chatBackground}
              onChange={(e) => updatePrivacy({ ...privacySettings, chatBackground: e.target.value as ChatBackgroundPreset })}
            >
              <option value="classic">Classic</option>
              <option value="midnight">Midnight</option>
              <option value="warm-sand">Warm Sand</option>
              <option value="emerald-mist">Emerald Mist</option>
            </select>
          </label>
          <label>
            {lang === "am" ? "የመልዕክት ገደብ (Info)" : "Message Limit (Info)"}
            <input
              type="number"
              min={1}
              max={100}
              value={liveControls.messageLimitBeforePaywall}
              onChange={(e) =>
                updateControls({
                  ...liveControls,
                  messageLimitBeforePaywall: Math.max(1, Number(e.target.value) || 5),
                })
              }
            />
          </label>
        </div>
      </section>
    </main>
  );
}
