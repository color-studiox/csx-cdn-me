(function(){"use strict";if(window.CSXAIBotLoaded)return;window.CSXAIBotLoaded=!0;const d=document.currentScript||document.querySelector('script[src*="csx.ai.chatbot.embed"], script[data-bot-id], script[data-bot-token]')||(function(){const e=document.getElementsByTagName("script");for(let i=e.length-1;i>=0;i--){if(e[i].src&&e[i].src.includes("csx.ai.chatbot.embed"))return e[i];if(e[i].getAttribute("data-bot-id"))return e[i]}return e[e.length-1]})();let k="https://chatbot.colorstudiox.com";const C=d&&(d.getAttribute("data-bot-id")||d.getAttribute("data-bot-token")||d.getAttribute("data-api-key"))||"";if(d&&d.getAttribute("data-api-host"))k=d.getAttribute("data-api-host").replace(/\/+$/,"");else if(d&&d.src)try{const e=new URL(d.src);!e.hostname.includes("jsdelivr.net")&&!e.hostname.includes("github")&&!e.hostname.includes("unpkg")&&!e.hostname.includes("fastly")&&(k=e.origin)}catch(e){}let E=localStorage.getItem("csx_ai_bot_session");E||(E="sess_"+Math.random().toString(36).substring(2)+Date.now().toString(36),localStorage.setItem("csx_ai_bot_session",E));let s={bot_name:"AI Assistant",greeting_message:"Hello! How can I help you today?",theme_color:"#2563eb",bot_avatar:"https://chatbot.colorstudiox.com/csx-ai-chatbot-icon.webp"},g=null,f=!1,L=!1;const p=document.createElement("div");p.id="csx-chat-widget-root",document.body.appendChild(p);const a=p.attachShadow({mode:"open"}),P=document.createElement("style");P.textContent=`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        
        .csx-chat-launcher {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 54px;
            height: 54px;
            border-radius: 50%;
            background: var(--theme-color, #2563eb);
            color: #ffffff;
            border: none;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .csx-chat-launcher:hover {
            transform: scale(1.06);
            box-shadow: 0 10px 25px rgba(37, 99, 235, 0.45);
        }

        @keyframes csxBounceLauncher {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
        .csx-chat-launcher.csx-anim-bounce:not(.is-open) {
            animation: csxBounceLauncher 2.4s infinite ease !important;
        }

        @keyframes csxPulseLauncher {
            0% { box-shadow: 0 0 0 0 var(--pulse-start, rgba(37, 99, 235, 0.75)); }
            70% { box-shadow: 0 0 0 15px var(--pulse-end, rgba(37, 99, 235, 0)); }
            100% { box-shadow: 0 0 0 0 var(--pulse-end, rgba(37, 99, 235, 0)); }
        }
        .csx-chat-launcher.csx-anim-pulse:not(.is-open) {
            animation: csxPulseLauncher 2s infinite ease-in-out !important;
        }
        .csx-chat-launcher svg {
            width: 25px;
            height: 25px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            transition: opacity 0.2s ease, transform 0.3s ease;
        }
        .csx-launcher-content {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .csx-launcher-text { display: none; }
        .csx-launcher-close-icon { display: none; }
        
        /* Completely hide launcher floating button when chat is open */
        .csx-chat-launcher.is-open {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }

        .csx-chat-window {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-width: calc(100vw - 32px);
            height: 500px;
            max-height: calc(100vh - 40px);
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.06);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 999998;
            opacity: 0;
            transform: translateY(16px) scale(0.96);
            pointer-events: none;
            transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .csx-chat-window.is-open {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        .csx-header {
            background: var(--theme-color, #2563eb);
            color: #ffffff;
            padding: 11px 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .csx-header-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .csx-avatar {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            object-fit: cover;
            background: #ffffff;
            padding: 2px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        }
        .csx-bot-name {
            font-size: 13.5px;
            font-weight: 700;
            line-height: 1.2;
        }
        .csx-bot-status {
            font-size: 11px;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .csx-status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        }

        .csx-messages {
            flex: 1;
            padding: 12px 14px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #f8fafc;
        }
        .csx-msg {
            max-width: 86%;
            padding: 8px 12px;
            border-radius: 14px;
            font-size: 12.5px;
            line-height: 1.42;
            word-wrap: break-word;
            white-space: normal;
            animation: csxFadeIn 0.3s ease;
        }
        @keyframes csxFadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .csx-msg-user {
            align-self: flex-end;
            background: var(--theme-color, #2563eb);
            color: #ffffff;
            border-bottom-right-radius: 3px;
        }
        .csx-msg-bot {
            align-self: flex-start;
            background: #ffffff;
            color: #0f172a;
            border-bottom-left-radius: 3px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .csx-msg-img {
            max-width: 100%;
            border-radius: 10px;
            margin-bottom: 6px;
            display: block;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .csx-quick-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 2px;
            margin-bottom: 6px;
            animation: csxFadeIn 0.3s ease;
        }
        .csx-chip-btn {
            background: #ffffff;
            border: 1.2px solid var(--theme-color, #2563eb);
            color: var(--theme-color, #2563eb);
            border-radius: 14px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            white-space: nowrap;
            outline: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .csx-chip-btn:hover {
            background: var(--theme-color, #2563eb);
            color: #ffffff;
            transform: translateY(-1px);
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
        }
        .csx-theme-whatsapp .csx-chip-btn {
            border-color: #075e54;
            color: #075e54;
            background: #ffffff;
        }
        .csx-theme-whatsapp .csx-chip-btn:hover {
            background: #075e54;
            color: #ffffff;
        }

        .csx-typing {
            align-self: flex-start;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 8px 13px;
            border-radius: 14px;
            border-bottom-left-radius: 3px;
            display: none;
            align-items: center;
            gap: 4px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
            margin-top: 2px;
        }
        .csx-typing span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--theme-color, #2563eb);
            display: inline-block;
            animation: csxBounce 1.4s infinite ease-in-out both;
        }
        .csx-typing span:nth-child(1) { animation-delay: -0.32s; }
        .csx-typing span:nth-child(2) { animation-delay: -0.16s; }
        .csx-typing span:nth-child(3) { animation-delay: 0s; }
        @keyframes csxBounce {
            0%, 80%, 100% { transform: scale(0.3); opacity: 0.4; }
            40% { transform: scale(1.0); opacity: 1; }
        }

        .csx-footer {
            padding: 8px 12px;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .csx-img-preview {
            display: none;
            align-items: center;
            gap: 6px;
            background: #eff6ff;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 11px;
            color: #1e40af;
        }
        .csx-img-preview img {
            width: 28px;
            height: 28px;
            border-radius: 4px;
            object-fit: cover;
        }
        .csx-img-preview .csx-remove-img {
            margin-left: auto;
            cursor: pointer;
            color: #ef4444;
            font-weight: bold;
            font-size: 15px;
        }

        .csx-input-row {
            display: flex;
            align-items: center;
            gap: 6px;
            width: 100%;
            box-sizing: border-box;
        }
        .csx-input {
            flex: 1;
            min-width: 0;
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #cbd5e1;
            border-radius: 20px;
            padding: 8px 13px;
            font-size: 12.5px;
            outline: none;
            transition: border-color 0.2s ease;
        }
        .csx-input:focus {
            border-color: var(--theme-color, #2563eb);
        }
        .csx-btn-icon {
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease, background 0.2s ease;
            flex-shrink: 0;
            width: 32px;
            height: 32px;
        }
        .csx-btn-icon:hover {
            color: var(--theme-color, #2563eb);
            background: #eff6ff;
        }
        .csx-send-btn {
            background: var(--theme-color, #2563eb);
            color: #ffffff;
            border: none;
            border-radius: 50%;
            width: 34px;
            height: 34px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s ease, transform 0.2s ease;
            box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
            flex-shrink: 0;
        }
        .csx-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .csx-file-input {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            width: 0 !important;
            height: 0 !important;
            pointer-events: none !important;
        }
        .csx-header-close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: #ffffff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
            flex-shrink: 0;
        }
        .csx-header-close-btn:hover {
            background: rgba(255, 255, 255, 0.35);
        }
        .csx-header-close-btn svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        @media (max-width: 640px) {
            .csx-chat-window {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                border-radius: 0 !important;
                margin: 0 !important;
                z-index: 9999999 !important;
            }
        }

        /* WhatsApp Theme Styling */
        .csx-theme-whatsapp .csx-chat-launcher {
            width: auto !important;
            height: 48px !important;
            border-radius: 26px !important;
            padding: 0 18px 0 14px !important;
            background: #25d366 !important;
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4) !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        .csx-theme-whatsapp .csx-chat-launcher:hover {
            transform: scale(1.04) !important;
            box-shadow: 0 10px 25px rgba(37, 211, 102, 0.55) !important;
        }
        .csx-theme-whatsapp .csx-launcher-chat-icon {
            stroke: none !important;
            stroke-width: 0 !important;
        }
        .csx-theme-whatsapp .csx-launcher-text {
            display: inline-block !important;
            font-size: 13.5px !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            white-space: nowrap !important;
            letter-spacing: 0.2px !important;
        }
        .csx-theme-whatsapp .csx-chat-launcher.is-open {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
        .csx-theme-whatsapp .csx-header {
            background: #075e54 !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .csx-theme-whatsapp .csx-messages {
            background-color: #efeae2 !important;
            background-image: url("data:image/svg+xml;utf8,<svg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><g fill='none' stroke='%23536471' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round' opacity='0.08'><path d='M40 50h40a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H56l-14 12v-12h-2a8 8 0 0 1-8-8V58a8 8 0 0 1 8-8z'/><circle cx='56' cy='70' r='2' fill='%23536471'/><circle cx='64' cy='70' r='2' fill='%23536471'/><circle cx='72' cy='70' r='2' fill='%23536471'/><circle cx='170' cy='65' r='16'/><path d='M170 55v10l7 4'/><path d='M280 50l30 15-30 15 6-15z'/><path d='M280 50l12 15-12 15'/><path d='M50 170h26a4 4 0 0 1 4 4v16a8 8 0 0 1-8 8H54a8 8 0 0 1-8-8v-16a4 4 0 0 1 4-4z'/><path d='M80 174h6a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4h-6'/><path d='M44 202h44'/><path d='M56 160c0 4 4 4 4 8m8-8c0 4 4 4 4 8'/><path d='M170 160c-8 0-14 6-14 14 0 10 14 22 14 22s14-12 14-22c0-8-6-14-14-14z'/><circle cx='170' cy='174' r='4'/><rect x='270' y='165' width='36' height='26' rx='5'/><circle cx='288' cy='178' r='7'/><path d='M282 165l-2-4h16l-2 4'/><path d='M54 280c-6-6-16-2-16 6 0 10 16 18 16 18s16-8 16-18c0-8-10-12-16-6z'/><path d='M152 290a18 18 0 0 1 36 0v10h-6v-10a12 12 0 0 0-24 0v10h-6z'/><rect x='148' y='292' width='6' height='12' rx='2' fill='%23536471'/><rect x='186' y='292' width='6' height='12' rx='2' fill='%23536471'/><path d='M290 270l3 8 8 3-8 3-3 8-3-8-8-3 8-3z'/><rect x='340' y='70' width='30' height='18' rx='4'/><path d='M346 76h18m-18 6h12'/><path d='M350 180a8 8 0 0 0-8-8v-2a2 2 0 0 0-4 0v2a8 8 0 0 0-8 8c0 6-3 8-3 8h26s-3-2-3-8z'/><path d='M336 190a3 3 0 0 0 6 0'/><path d='M360 280v18a5 5 0 1 1-4-4.8V276l16-4v16a5 5 0 1 1-4-4.8V272z'/><circle cx='90' cy='350' r='8'/><path d='M90 336v4m0 20v4m-14-14h4m20 0h4m-11-11l3 3m14 14l3 3m-20 0l3-3m14-14l3-3'/><path d='M220 340l14-6 14 6v10c0 10-14 18-14 18s-14-8-14-18z'/><path d='M228 348l4 4 8-8'/><path d='M310 340c6-10 18-14 18-14s-4 12-14 18l-4-4z'/><circle cx='318' cy='336' r='2' fill='%23536471'/></g></svg>") !important;
            background-size: 380px 380px !important;
        }
        .csx-theme-whatsapp .csx-msg-bot {
            background: #ffffff !important;
            color: #111b21 !important;
            border: none !important;
            border-radius: 0px 10px 10px 10px !important;
            box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13) !important;
        }
        .csx-theme-whatsapp .csx-msg-user {
            background: #d9fdd3 !important;
            color: #111b21 !important;
            border-radius: 10px 0px 10px 10px !important;
            box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13) !important;
        }
        .csx-theme-whatsapp .csx-typing {
            background: #ffffff !important;
            border: none !important;
            border-radius: 0px 10px 10px 10px !important;
            box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13) !important;
        }
        .csx-theme-whatsapp .csx-footer {
            background: #f0f2f5 !important;
            border-top: 1px solid #e9edef !important;
        }
        .csx-theme-whatsapp .csx-input {
            background: #ffffff !important;
            border: 1px solid #e9edef !important;
            border-radius: 18px !important;
        }
        .csx-theme-whatsapp .csx-send-btn {
            background: #00a884 !important;
            box-shadow: 0 2px 6px rgba(0, 168, 132, 0.3) !important;
        }
        .csx-theme-whatsapp .csx-send-btn:hover {
            background: #008f70 !important;
        }
        .csx-theme-whatsapp .csx-btn-icon:hover {
            color: #00a884 !important;
            background: #e9edef !important;
        }
    `,a.appendChild(P);const y=document.createElement("div");y.innerHTML=`
            <button class="csx-chat-launcher" id="csx-launcher">
                <span class="csx-launcher-content">
                    <svg class="csx-launcher-chat-icon" id="csx-launcher-chat-icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span class="csx-launcher-text" id="csx-launcher-text">Chat Now</span>
                </span>
                <svg class="csx-launcher-close-icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

        <div class="csx-chat-window" id="csx-window">
            <div class="csx-header">
                <div class="csx-header-info">
                    <img class="csx-avatar" id="csx-avatar" src="${s.bot_avatar}" alt="Avatar" />
                    <div>
                        <div class="csx-bot-name" id="csx-bot-name">${s.bot_name}</div>
                        <div class="csx-bot-status"><span class="csx-status-dot"></span> Online</div>
                    </div>
                </div>
                <button class="csx-header-close-btn" id="csx-header-close-btn" title="Close Chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div class="csx-messages" id="csx-messages">
                <div class="csx-msg csx-msg-bot" id="csx-greeting">${s.greeting_message}</div>
                <div class="csx-quick-chips" id="csx-quick-chips"></div>
                <div class="csx-typing" id="csx-typing">
                    <span></span><span></span><span></span>
                </div>
            </div>

            <div class="csx-footer">
                <div class="csx-img-preview" id="csx-img-preview">
                    <img id="csx-preview-img-tag" src="" />
                    <span id="csx-preview-name">image.jpg</span>
                    <span class="csx-remove-img" id="csx-remove-img">&times;</span>
                </div>
                <div class="csx-input-row">
                    <input type="file" id="csx-file-input" class="csx-file-input" accept="image/png, image/jpeg, image/webp, image/gif" />
                    <button class="csx-btn-icon" id="csx-attach-btn" title="Attach Image">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                    <input type="text" class="csx-input" id="csx-input-msg" placeholder="Type a message..." />
                    <button class="csx-send-btn" id="csx-send-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </div>
    `,a.appendChild(y);const m=a.getElementById("csx-launcher"),M=a.getElementById("csx-window"),l=a.getElementById("csx-messages"),_=a.getElementById("csx-typing"),x=a.getElementById("csx-input-msg"),u=a.getElementById("csx-send-btn"),I=a.getElementById("csx-file-input"),v=a.getElementById("csx-attach-btn"),T=a.getElementById("csx-img-preview"),q=a.getElementById("csx-preview-img-tag"),Y=a.getElementById("csx-preview-name"),$=a.getElementById("csx-remove-img"),B=a.getElementById("csx-bot-name"),z=a.getElementById("csx-avatar"),b=a.getElementById("csx-greeting");function H(e){if(!e)return"";let t=e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return t=t.replace(/\*\*([\s\S]*?)\*\*/g,"<strong>$1</strong>"),t=t.replace(/__([\s\S]*?)__/g,"<strong>$1</strong>"),t=t.replace(/\*([^\*\n]+)\*/g,"<em>$1</em>"),t=t.replace(/^[*\-]\s+/gm,"\u2022 "),t=t.replace(/\*\*/g,""),t=t.replace(/\r\n/g,`
`).replace(/\r/g,`
`),t=t.replace(/\n{3,}/g,`

`),t=t.replace(/\n/g,"<br>"),t}function w(e,t){if(!e)return"rgba(37, 99, 235, "+t+")";var c=e.replace("#","").trim();if(c.length===3&&(c=c.split("").map(function(i){return i+i}).join("")),c.length!==6)return"rgba(37, 99, 235, "+t+")";var o=parseInt(c,16),n=o>>16&255,h=o>>8&255,r=o&255;return"rgba("+n+", "+h+", "+r+", "+t+")"}let F=k+"/api/widget-config.php";const A=[];C&&A.push("bot_token="+encodeURIComponent(C)),window.location&&window.location.hostname&&A.push("domain="+encodeURIComponent(window.location.hostname)),A.length>0&&(F+="?"+A.join("&")),fetch(F).then(e=>e.json()).then(e=>{if(e&&e.is_authorized===!1)B&&(B.textContent=e.bot_name||"CSX AI Agent"),z&&(z.src=e.bot_avatar||"https://chatbot.colorstudiox.com/csx-ai-chatbot-icon.webp"),b&&(b.innerHTML=H(e.greeting_message||`**Unauthorized Website Domain**

This website domain is not registered.`)+'<br><br><a href="https://chatbot.colorstudiox.com" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#2563eb; color:#ffffff; padding:10px 18px; border-radius:10px; text-decoration:none; font-weight:700; font-size:13px; box-shadow:0 4px 10px rgba(37,99,235,0.3);">Contact ColorStudioX to Connect Domain</a>'),x.disabled=!0,x.placeholder="Domain not authorized. Contact Admin...",x.style.background="#f1f5f9",x.style.cursor="not-allowed",v.disabled=!0,v.style.opacity="0.4",v.style.cursor="not-allowed",v.style.pointerEvents="none",u.disabled=!0,u.style.opacity="0.4",u.style.cursor="not-allowed";else if(e&&e.bot_name){s=Object.assign(s,e),p.style.setProperty("--theme-color",s.theme_color),p.style.setProperty("--pulse-start",w(s.theme_color,.75)),p.style.setProperty("--pulse-end",w(s.theme_color,0)),B&&(B.textContent=s.bot_name),z&&s.bot_avatar&&(z.src=s.bot_avatar),b&&s.greeting_message&&(b.innerHTML=H(s.greeting_message));const t=a.getElementById("csx-quick-chips");t&&Array.isArray(s.quick_buttons)&&s.quick_buttons.length>0&&(t.innerHTML="",s.quick_buttons.forEach(o=>{const n=document.createElement("button");n.type="button",n.className="csx-chip-btn",n.textContent=o,n.addEventListener("click",()=>{x.value=o,D()}),t.appendChild(n)}));const c=s.launcher_animation||"bounce";if(c!=="none"&&m&&m.classList.add("csx-anim-"+c),s.widget_theme==="whatsapp"){y.classList.add("csx-theme-whatsapp");const o=a.getElementById("csx-launcher-chat-icon");o&&(o.setAttribute("viewBox","0 0 24 24"),o.setAttribute("fill","none"),o.setAttribute("stroke","none"),o.style.width="24px",o.style.height="24px",o.innerHTML='<path fill-rule="evenodd" clip-rule="evenodd" d="M12.004 2C6.48 2 2.004 6.476 2.004 12c0 1.81.484 3.513 1.327 4.982L2.05 21.95l5.12-1.343A9.957 9.957 0 0 0 12.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm5.834 14.288c-.244.686-1.222 1.347-2.003 1.488-.535.096-1.233.173-3.585-.801-3.01-1.246-4.945-4.305-5.095-4.505-.149-.2-1.222-1.626-1.222-3.1 0-1.475.772-2.2 1.045-2.5.274-.3.597-.374.796-.374.199 0 .398.002.572.01.187.01.436-.07.683.523.25.6.846 2.07.92 2.22.075.15.125.324.025.524-.1.2-.15.324-.3.498-.15.175-.315.39-.45.524-.15.149-.306.312-.132.611.175.3.775 1.28 1.662 2.07 1.144 1.02 2.107 1.336 2.406 1.485.3.15.474.125.649-.075.174-.2.747-.872.946-1.171.199-.3.398-.25.672-.15.274.1 1.741.821 2.04.97.299.15.498.224.572.348.075.125.075.723-.169 1.409z" fill="#ffffff"></path>')}else if(s.launcher_icon){const o=a.getElementById("csx-launcher-chat-icon");if(o){const n=document.createElement("img");n.className="csx-launcher-chat-icon csx-launcher-icon-img",n.src=s.launcher_icon,n.alt="Chat",n.style.width="30px",n.style.height="30px",n.style.objectFit="contain",o.parentNode.replaceChild(n,o)}}}else e&&e.message&&b&&(b.textContent=e.message)}).catch(e=>console.error("CSX Chatbot Config Load Error:",e));function R(){f=!0,m.classList.add("is-open"),M.classList.add("is-open"),setTimeout(()=>x.focus(),150)}function N(){f=!1,m.classList.remove("is-open"),M.classList.remove("is-open")}const U=a.getElementById("csx-header-close-btn");U&&U.addEventListener("click",N),m.addEventListener("click",()=>{f?N():R()}),m.addEventListener("mouseenter",()=>{s.launcher_trigger==="hover"&&!f&&R()}),v.addEventListener("click",()=>I.click()),I.addEventListener("change",e=>{const t=e.target.files[0];if(t){g=t,Y.textContent=t.name;const c=new FileReader;c.onload=o=>{q.src=o.target.result,T.style.display="flex"},c.readAsDataURL(t)}}),$.addEventListener("click",()=>{g=null,I.value="",T.style.display="none"});function O(e,t){if(!e||!e.type||!e.type.startsWith("image/")){t(e);return}const c=new FileReader;c.onload=function(o){const n=new Image;n.onload=function(){let r=n.width,i=n.height;(r>1200||i>1200)&&(r>i?(i=Math.round(i*1200/r),r=1200):(r=Math.round(r*1200/i),i=1200));const j=document.createElement("canvas");j.width=r,j.height=i,j.getContext("2d").drawImage(n,0,0,r,i),j.toBlob(S=>{if(S&&S.size<e.size){const V=new File([S],e.name.replace(/\.[^/.]+$/,"")+".jpg",{type:"image/jpeg",lastModified:Date.now()});t(V)}else t(e)},"image/jpeg",.8)},n.onerror=()=>t(e),n.src=o.target.result},c.onerror=()=>t(e),c.readAsDataURL(e)}function D(){const e=x.value.trim();if(!e&&!g||L)return;L=!0,u.disabled=!0;const t=document.createElement("div");if(t.className="csx-msg csx-msg-user",g){const n=document.createElement("img");n.className="csx-msg-img",n.src=URL.createObjectURL(g),t.appendChild(n)}if(e){const n=document.createElement("div");n.textContent=e,t.appendChild(n)}l.appendChild(t),l.scrollTop=l.scrollHeight;const c=g,o=e;x.value="",g=null,I.value="",T.style.display="none",_.style.display="flex",l.appendChild(_),l.scrollTop=l.scrollHeight,O(c,n=>{const h=new FormData;h.append("session_id",E),h.append("message",o),C&&h.append("bot_token",C),window.location&&window.location.hostname&&h.append("domain",window.location.hostname),n&&h.append("image",n),fetch(k+"/api/chat.php",{method:"POST",body:h}).then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}).then(r=>{_.style.display="none",L=!1,u.disabled=!1;const i=document.createElement("div");i.className="csx-msg csx-msg-bot",r.status==="success"?i.innerHTML=H(r.reply):(i.textContent=r.message||"An error occurred while connecting to AI.",i.style.color="#ef4444"),l.appendChild(i),l.scrollTop=l.scrollHeight}).catch(r=>{_.style.display="none",L=!1,u.disabled=!1;const i=document.createElement("div");i.className="csx-msg csx-msg-bot",i.textContent="Connection error ("+r.message+"). Please try again.",i.style.color="#ef4444",l.appendChild(i),l.scrollTop=l.scrollHeight})})}u.addEventListener("click",D),x.addEventListener("keydown",e=>{e.key==="Enter"&&D()}),window.CSXChatbot={open:function(e){e&&this.setTheme(e),f=!0,m.classList.add("is-open"),M.classList.add("is-open"),setTimeout(()=>x.focus(),150)},close:function(){f=!1,m.classList.remove("is-open"),M.classList.remove("is-open")},toggle:function(e){f?this.close():this.open(e)},setTheme:function(e){const t=a.getElementById("csx-launcher-chat-icon");e==="whatsapp"?(y.classList.add("csx-theme-whatsapp"),p.style.setProperty("--pulse-start","rgba(37, 211, 102, 0.75)"),p.style.setProperty("--pulse-end","rgba(37, 211, 102, 0)"),t&&(t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","none"),t.setAttribute("stroke","none"),t.style.width="24px",t.style.height="24px",t.innerHTML='<path d="M6.014 8.00613C6.12827 7.1024 7.30277 5.87414 8.23488 6.01043L8.23339 6.00894C9.14051 6.18132 9.85859 7.74261 10.2635 8.44465C10.5504 8.95402 10.3641 9.4701 10.0965 9.68787C9.7355 9.97883 9.17099 10.3803 9.28943 10.7834C9.5 11.5 12 14 13.2296 14.7107C13.695 14.9797 14.0325 14.2702 14.3207 13.9067C14.5301 13.6271 15.0466 13.46 15.5548 13.736C16.3138 14.178 17.0288 14.6917 17.69 15.27C18.0202 15.546 18.0977 15.9539 17.8689 16.385C17.4659 17.1443 16.3003 18.1456 15.4542 17.9421C13.9764 17.5868 8 15.27 6.08033 8.55801C5.97237 8.24048 5.99955 8.12044 6.014 8.00613Z" fill="#ffffff"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z" fill="#ffffff"></path>')):(y.classList.remove("csx-theme-whatsapp"),p.style.setProperty("--pulse-start",w(s.theme_color,.75)),p.style.setProperty("--pulse-end",w(s.theme_color,0)),t&&(t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","none"),t.setAttribute("stroke","currentColor"),t.style.width="24px",t.style.height="24px",t.innerHTML='<path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>'))},setColor:function(e){s.theme_color=e,p.style.setProperty("--theme-color",e),p.style.setProperty("--pulse-start",w(e,.75)),p.style.setProperty("--pulse-end",w(e,0))}}})();
