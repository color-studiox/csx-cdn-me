/**
 * ChatMe.lk AI Live Chatbot Widget (Client Embed Script)
 * Version: 2.5.0 (Laravel Platform Edition)
 * Core Features:
 *  - Zero external dependencies (Vanilla JS + Isolated Shadow DOM)
 *  - Complete CSS isolation preventing style bleeding in & out
 *  - Multi-theme support: Default Modern SaaS & WhatsApp Theme
 *  - Native Light & Dark Mode matching parent website ambiance
 *  - Suggestion prompt chips & auto-expanding multiline input
 *  - Client-side Canvas image compression before upload
 *  - Strict domain verification & enterprise token authentication
 *  - Mobile responsive full-screen takeover with native gesture feel
 * 
 * Copyright (c) 2026 ChatMe.lk. All rights reserved.
 */
(function () {
    "use strict";

    if (window.CSXAIBotLoaded) return;
    window.CSXAIBotLoaded = true;

    // 1. Detect Host Script Tag & Config Attributes
    const currentScript = document.currentScript || document.querySelector('script[src*="csx.chatme.lk.embed"], script[src*="csx.ai.chatbot.embed"], script[data-bot-id], script[data-bot-token]') || (function () {
        const scripts = document.getElementsByTagName("script");
        for (let i = scripts.length - 1; i >= 0; i--) {
            if (scripts[i].src && (scripts[i].src.includes("csx.chatme.lk.embed") || scripts[i].src.includes("csx.ai.chatbot.embed"))) return scripts[i];
            if (scripts[i].getAttribute("data-bot-id") || scripts[i].getAttribute("data-bot-token")) return scripts[i];
        }
        return scripts[scripts.length - 1];
    })();

    // Default API Host for the platform
    let apiHost = "https://app.chatme.lk";
    const botToken = currentScript && (currentScript.getAttribute("data-bot-id") || currentScript.getAttribute("data-bot-token") || currentScript.getAttribute("data-api-key")) || "";

    if (currentScript && currentScript.getAttribute("data-api-host")) {
        apiHost = currentScript.getAttribute("data-api-host").replace(/\/+$/, "");
    } else if (currentScript && currentScript.src) {
        try {
            const parsedUrl = new URL(currentScript.src);
            const knownCdns = ["jsdelivr.net", "github", "unpkg", "fastly", "cloudflare", "cdnjs", "cdn."];
            const isCdn = knownCdns.some(cdn => parsedUrl.hostname.includes(cdn)) || parsedUrl.hostname.startsWith("cdn.");
            // If the script is hosted on localhost or dev server, use that origin; otherwise default to https://app.chatme.lk
            if (!isCdn && (parsedUrl.hostname.includes("localhost") || parsedUrl.hostname.includes("127.0.0.1"))) {
                apiHost = parsedUrl.origin;
            }
        } catch (e) {}
    }

    // 2. Persistent Session Management
    let sessionId = localStorage.getItem("csx_ai_bot_session");
    if (!sessionId) {
        sessionId = "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("csx_ai_bot_session", sessionId);
    }

    // Default Bot Configuration
    let botConfig = {
        bot_name: "AI Assistant",
        greeting_message: "Hello! How can I help you today?",
        theme_color: "#2563eb",
        widget_theme: "default",
        chat_mode: "light",
        launcher_animation: "pulse",
        launcher_trigger: "hover",
        bot_avatar: apiHost + "/assets/img/chatme-lk-ai-powered-customer-support-chatbot-favicon-compressed.webp",
        launcher_icon: null,
        quick_buttons: [
            "Ask Questions",
            "Products & Pricing",
            "Contact Us",
            "Request Quote"
        ]
    };

    let attachedFile = null;
    let isOpen = false;
    let isSending = false;

    // 3. Create Root Stacking Container with Top-Level Z-Index
    const rootEl = document.createElement("div");
    rootEl.id = "csx-chat-widget-root";
    rootEl.style.cssText = "position: fixed !important; bottom: 0 !important; right: 0 !important; width: 0 !important; height: 0 !important; overflow: visible !important; z-index: 2147483647 !important; pointer-events: none !important;";
    document.body.appendChild(rootEl);

    // 4. Attach Isolated Shadow DOM
    const shadowRoot = rootEl.attachShadow({ mode: "open" });
    const styleEl = document.createElement("style");

    styleEl.textContent = `
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        
        :host {
            position: fixed !important;
            bottom: 0 !important;
            right: 0 !important;
            width: 0 !important;
            height: 0 !important;
            overflow: visible !important;
            z-index: 2147483647 !important;
            pointer-events: none !important;
        }

        #csx-chat-widget-root {
            position: fixed !important;
            bottom: 0 !important;
            right: 0 !important;
            width: 0 !important;
            height: 0 !important;
            overflow: visible !important;
            z-index: 2147483647 !important;
            pointer-events: none !important;
        }

        /* Launcher Button */
        .csx-chat-launcher * { pointer-events: none; }
        .csx-chat-launcher {
            position: fixed !important;
            bottom: 22px !important;
            right: 22px !important;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--theme-color, #2563eb);
            color: #ffffff;
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 24px var(--launcher-shadow-base, rgba(37, 99, 235, 0.35));
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2147483647 !important;
            pointer-events: auto !important;
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .csx-chat-launcher:hover {
            transform: scale(1.08);
            box-shadow: 0 12px 30px var(--launcher-shadow-hover, rgba(37, 99, 235, 0.48));
        }

        /* Launcher Animations */
        @keyframes csxBounceLauncher {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
        .csx-chat-launcher.csx-anim-bounce:not(.is-open) {
            animation: csxBounceLauncher 2.5s infinite ease !important;
        }

        @keyframes csxPulseLauncher {
            0% {
                box-shadow: 0 6px 20px var(--launcher-shadow-base, rgba(37, 99, 235, 0.35)),
                            0 0 0 0 var(--pulse-start, rgba(37, 99, 235, 0.75)),
                            0 0 0 0 var(--pulse-glow, rgba(37, 99, 235, 0.45));
            }
            50% {
                box-shadow: 0 6px 20px var(--launcher-shadow-base, rgba(37, 99, 235, 0.35)),
                            0 0 0 12px var(--pulse-mid, rgba(37, 99, 235, 0.35)),
                            0 0 14px 2px var(--pulse-glow, rgba(37, 99, 235, 0.25));
            }
            70% {
                box-shadow: 0 6px 20px var(--launcher-shadow-base, rgba(37, 99, 235, 0.35)),
                            0 0 0 18px var(--pulse-end, rgba(37, 99, 235, 0)),
                            0 0 20px 4px var(--pulse-end, rgba(37, 99, 235, 0));
            }
            100% {
                box-shadow: 0 6px 20px var(--launcher-shadow-base, rgba(37, 99, 235, 0.35)),
                            0 0 0 0 var(--pulse-end, rgba(37, 99, 235, 0)),
                            0 0 0 0 var(--pulse-end, rgba(37, 99, 235, 0));
            }
        }
        .csx-chat-launcher.csx-anim-pulse:not(.is-open) {
            animation: csxPulseLauncher 2s infinite ease-out !important;
        }

        .csx-chat-launcher svg {
            width: 26px;
            height: 26px;
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

        /* Icon-Only Mode (when custom launcher icon is set) */
        .csx-chat-launcher.csx-launcher-icon-only,
        .csx-theme-whatsapp .csx-chat-launcher.csx-launcher-icon-only {
            width: 56px !important;
            height: 56px !important;
            border-radius: 50% !important;
            padding: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        .csx-chat-launcher.csx-launcher-icon-only .csx-launcher-text,
        .csx-theme-whatsapp .csx-chat-launcher.csx-launcher-icon-only .csx-launcher-text {
            display: none !important;
        }
        .csx-chat-launcher.csx-launcher-icon-only .csx-launcher-content {
            gap: 0 !important;
        }
        .csx-chat-launcher.csx-launcher-icon-only .csx-launcher-icon-img {
            width: 32px !important;
            height: 32px !important;
            object-fit: contain !important;
            display: block !important;
        }
        
        .csx-chat-launcher.is-open {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }

        /* Chat Window */
        .csx-chat-window {
            position: fixed !important;
            bottom: 22px !important;
            right: 22px !important;
            width: 360px;
            max-width: calc(100vw - 32px);
            height: 520px;
            max-height: calc(100vh - 44px);
            background: #ffffff;
            border-radius: 18px;
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.06);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 2147483647 !important;
            opacity: 0;
            transform: translateY(18px) scale(0.96);
            pointer-events: none !important;
            transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .csx-chat-window.is-open {
            opacity: 1 !important;
            transform: translateY(0) scale(1) !important;
            pointer-events: auto !important;
        }

        /* Chat Header */
        .csx-header {
            background: var(--theme-color, #2563eb);
            color: #ffffff;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            flex-shrink: 0;
        }
        .csx-header-info {
            display: flex;
            align-items: center;
            gap: 11px;
        }
        .csx-avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            object-fit: cover;
            background: #ffffff;
            padding: 2px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.18);
            flex-shrink: 0;
        }
        .csx-bot-name {
            font-size: 14px;
            font-weight: 700;
            line-height: 1.25;
            letter-spacing: -0.2px;
        }
        .csx-bot-status {
            font-size: 11.5px;
            opacity: 0.92;
            display: flex;
            align-items: center;
            gap: 5px;
            margin-top: 1px;
        }
        .csx-status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.35);
        }
        .csx-header-close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: #ffffff;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease, transform 0.2s ease;
            flex-shrink: 0;
        }
        .csx-header-close-btn:hover {
            background: rgba(255, 255, 255, 0.35);
            transform: scale(1.05);
        }
        .csx-header-close-btn svg {
            width: 17px;
            height: 17px;
            stroke: currentColor;
            stroke-width: 2.4;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        /* Messages Body */
        .csx-messages {
            flex: 1;
            padding: 14px 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #f8fafc;
            scroll-behavior: smooth;
        }
        .csx-messages::-webkit-scrollbar {
            width: 5px;
        }
        .csx-messages::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.15);
            border-radius: 4px;
        }

        .csx-msg {
            max-width: 86%;
            padding: 8px 12px 6px 12px;
            border-radius: 14px;
            font-size: 13px;
            line-height: 1.48;
            word-wrap: break-word;
            word-break: break-word;
            animation: csxFadeIn 0.28s ease;
            position: relative;
            box-sizing: border-box;
        }
        @keyframes csxFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .csx-msg a {
            color: inherit;
            text-decoration: underline;
            font-weight: 600;
        }
        .csx-msg-content {
            display: inline;
            word-break: break-word;
            white-space: pre-wrap;
        }
        .csx-msg-bot .csx-msg-content {
            white-space: normal;
        }
        .csx-msg-meta {
            float: right;
            margin-left: 9px;
            margin-top: 4px;
            display: inline-flex;
            align-items: center;
            gap: 3px;
            font-size: 10.5px;
            line-height: 1;
            user-select: none;
            vertical-align: bottom;
            white-space: nowrap;
        }
        .csx-msg-ticks {
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
        }
        .csx-msg-ticks svg {
            width: 15px;
            height: 11px;
            display: block;
        }
        .csx-msg-user {
            align-self: flex-end;
            background: var(--theme-color, #2563eb);
            color: #ffffff;
            border-bottom-right-radius: 3px;
            box-shadow: 0 2px 8px var(--user-bubble-shadow, rgba(37, 99, 235, 0.25));
        }
        .csx-msg-user .csx-msg-meta {
            color: rgba(255, 255, 255, 0.75);
        }
        .csx-msg-bot {
            align-self: flex-start;
            background: #ffffff;
            color: #0f172a;
            border-bottom-left-radius: 3px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
        }
        .csx-msg-bot .csx-msg-meta {
            color: #667781;
        }
        .csx-msg-img {
            max-width: 100%;
            border-radius: 10px;
            margin-bottom: 6px;
            display: block;
            box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }

        /* Suggestion Quick Chips */
        .csx-quick-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 4px;
            margin-bottom: 6px;
            animation: csxFadeIn 0.3s ease;
        }
        .csx-chip-btn {
            background: #ffffff;
            border: 1.2px solid var(--theme-color, #2563eb);
            color: var(--theme-color, #2563eb);
            border-radius: 16px;
            padding: 5px 11px;
            font-size: 11.5px;
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
            box-shadow: 0 3px 8px rgba(37, 99, 235, 0.2);
        }

        /* Typing Indicator */
        .csx-typing {
            align-self: flex-start;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 9px 14px;
            border-radius: 14px;
            border-bottom-left-radius: 3px;
            display: none;
            align-items: center;
            gap: 4.5px;
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
            0%, 80%, 100% { transform: scale(0.35); opacity: 0.4; }
            40% { transform: scale(1.05); opacity: 1; }
        }

        /* Footer & Input Bar */
        .csx-footer {
            padding: 9px 14px;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            gap: 7px;
            flex-shrink: 0;
        }
        .csx-img-preview {
            display: none;
            align-items: center;
            gap: 8px;
            background: #eff6ff;
            padding: 5px 11px;
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
            font-size: 16px;
        }

        .csx-input-row {
            display: flex;
            align-items: flex-end;
            gap: 7px;
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
            padding: 9px 14px;
            font-size: 13.5px;
            line-height: 20px;
            outline: none;
            resize: none;
            min-height: 40px;
            max-height: 110px;
            height: 40px;
            overflow-y: hidden;
            overflow-x: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            font-family: inherit;
            background: #ffffff;
            color: #0f172a;
        }
        .csx-input.is-multiline {
            white-space: pre-wrap !important;
            overflow-y: auto !important;
        }
        .csx-input::placeholder {
            color: #94a3b8;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            line-height: 20px;
        }
        .csx-input:disabled {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            background: #f1f5f9 !important;
            cursor: not-allowed !important;
            color: #94a3b8 !important;
            line-height: 20px !important;
            height: 40px !important;
        }
        .csx-input:disabled::placeholder {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            color: #94a3b8 !important;
            line-height: 20px !important;
        }
        .csx-input:focus {
            border-color: var(--theme-color, #2563eb);
            box-shadow: 0 0 0 3px var(--input-focus-ring, rgba(37, 99, 235, 0.12));
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
            width: 35px;
            height: 35px;
            margin-bottom: 1.5px;
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
            width: 37px;
            height: 37px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s ease, transform 0.2s ease;
            box-shadow: 0 2px 8px var(--send-btn-shadow, rgba(37, 99, 235, 0.3));
            flex-shrink: 0;
            margin-bottom: 0.5px;
        }
        .csx-send-btn:hover:not(:disabled) {
            transform: scale(1.05);
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

        /* Mobile Fullscreen Mode */
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
                z-index: 2147483647 !important;
            }
        }

        /* =======================================================
           DARK MODE STYLING (.csx-mode-dark)
           ======================================================= */
        .csx-mode-dark .csx-chat-window {
            background: #0f172a !important;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
            color: #f8fafc !important;
        }
        .csx-mode-dark .csx-messages {
            background: #090d16 !important;
        }
        .csx-mode-dark .csx-msg-bot {
            background: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #334155 !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
        }
        .csx-mode-dark .csx-chip-btn {
            background: #1e293b !important;
            border-color: var(--theme-color, #3b82f6) !important;
            color: #93c5fd !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
        }
        .csx-mode-dark .csx-chip-btn:hover {
            background: var(--theme-color, #3b82f6) !important;
            color: #ffffff !important;
        }
        .csx-mode-dark .csx-typing {
            background: #1e293b !important;
            border-color: #334155 !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
        }
        .csx-mode-dark .csx-footer {
            background: #1e293b !important;
            border-top: 1px solid #334155 !important;
        }
        .csx-mode-dark .csx-input {
            background: #0f172a !important;
            border-color: #334155 !important;
            color: #f8fafc !important;
        }
        .csx-mode-dark .csx-input::placeholder {
            color: #64748b !important;
        }
        .csx-mode-dark .csx-btn-icon {
            color: #94a3b8 !important;
        }
        .csx-mode-dark .csx-btn-icon:hover {
            color: #38bdf8 !important;
            background: rgba(255, 255, 255, 0.08) !important;
        }
        .csx-mode-dark .csx-img-preview {
            background: #0f172a !important;
            color: #93c5fd !important;
            border: 1px solid #334155 !important;
        }

        /* =======================================================
           WHATSAPP THEME STYLING (.csx-theme-whatsapp)
           ======================================================= */
        .csx-theme-whatsapp .csx-chat-launcher {
            width: auto !important;
            height: 48px !important;
            border-radius: 26px !important;
            padding: 0 18px 0 14px !important;
            background: #25d366 !important;
            box-shadow: 0 6px 20px var(--launcher-shadow-base, rgba(37, 211, 102, 0.4));
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        .csx-theme-whatsapp .csx-chat-launcher:hover {
            transform: scale(1.04) !important;
            box-shadow: 0 10px 25px var(--launcher-shadow-hover, rgba(37, 211, 102, 0.55));
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
            border-radius: 0px 8px 8px 8px !important;
            box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13) !important;
        }
        .csx-theme-whatsapp .csx-msg-bot .csx-msg-meta {
            color: #667781 !important;
        }
        .csx-theme-whatsapp .csx-msg-user {
            background: #d9fdd3 !important;
            color: #111b21 !important;
            border-radius: 8px 0px 8px 8px !important;
            box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13) !important;
        }
        .csx-theme-whatsapp .csx-msg-user .csx-msg-meta {
            color: #667781 !important;
        }
        .csx-theme-whatsapp .csx-msg-ticks svg path {
            fill: #53bdeb !important;
        }
        .csx-theme-whatsapp .csx-chip-btn {
            border: 1px solid rgba(0, 168, 132, 0.28) !important;
            color: #075e54 !important;
            background: #ffffff !important;
            border-radius: 16px !important;
            box-shadow: 0 1px 2px rgba(11, 20, 26, 0.08) !important;
        }
        .csx-theme-whatsapp .csx-chip-btn:hover {
            background: #e7fce3 !important;
            color: #008069 !important;
            border-color: #00a884 !important;
        }
        .csx-theme-whatsapp .csx-typing {
            background: #ffffff !important;
            border: none !important;
            border-radius: 0px 8px 8px 8px !important;
            box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13) !important;
            padding: 9px 13px !important;
            gap: 5px !important;
        }
        .csx-theme-whatsapp .csx-typing span {
            background: #8696a0 !important;
            width: 7px !important;
            height: 7px !important;
            animation: csxWaBounce 1.4s infinite ease-in-out both !important;
        }
        .csx-theme-whatsapp .csx-footer {
            background: #f0f2f5 !important;
            border-top: 1px solid #e9edef !important;
        }
        .csx-theme-whatsapp .csx-input {
            background: #ffffff !important;
            border: 1px solid #e9edef !important;
            border-radius: 20px !important;
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
        @keyframes csxWaBounce {
            0%, 80%, 100% { transform: scale(0.35); opacity: 0.35; }
            40% { transform: scale(1.05); opacity: 0.95; }
        }

        /* WhatsApp Dark Mode */
        .csx-theme-whatsapp.csx-mode-dark .csx-header {
            background: #1f2c34 !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-messages {
            background-color: #0b141a !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-msg-bot {
            background: #202c33 !important;
            color: #e9edef !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-msg-bot .csx-msg-meta {
            color: #8696a0 !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-msg-user {
            background: #005c4b !important;
            color: #e9edef !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-msg-user .csx-msg-meta {
            color: #8696a0 !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-msg-ticks svg path {
            fill: #53bdeb !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-typing {
            background: #202c33 !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-typing span {
            background: #8696a0 !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-footer {
            background: #1f2c34 !important;
            border-top-color: #2a3942 !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-input {
            background: #2a3942 !important;
            border-color: #2a3942 !important;
            color: #e9edef !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-chip-btn {
            background: #202c33 !important;
            color: #00a884 !important;
            border-color: #2a3942 !important;
        }
        .csx-theme-whatsapp.csx-mode-dark .csx-chip-btn:hover {
            background: #005c4b !important;
            color: #ffffff !important;
        }
    `;

    shadowRoot.appendChild(styleEl);

    // 5. Build Widget HTML Structure
    const widgetContainer = document.createElement("div");
    widgetContainer.id = "csx-widget-container";
    widgetContainer.innerHTML = `
        <button class="csx-chat-launcher" id="csx-launcher" aria-label="Open AI Chat">
            <span class="csx-launcher-content">
                <svg class="csx-launcher-chat-icon" id="csx-launcher-chat-icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span class="csx-launcher-text" id="csx-launcher-text">Chat Now</span>
            </span>
            <svg class="csx-launcher-close-icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div class="csx-chat-window" id="csx-window" role="dialog" aria-modal="true" aria-label="Chatbot Dialog">
            <div class="csx-header">
                <div class="csx-header-info">
                    <img class="csx-avatar" id="csx-avatar" src="${botConfig.bot_avatar}" alt="Avatar" onerror="this.onerror=null;this.src='" + apiHost + "/assets/img/chatme-lk-ai-powered-customer-support-chatbot-favicon-compressed.webp';" />
                    <div>
                        <div class="csx-bot-name" id="csx-bot-name">${botConfig.bot_name}</div>
                        <div class="csx-bot-status"><span class="csx-status-dot"></span> Online</div>
                    </div>
                </div>
                <button class="csx-header-close-btn" id="csx-header-close-btn" title="Close Chat" aria-label="Close Chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div class="csx-messages" id="csx-messages">
                <div class="csx-msg csx-msg-bot" id="csx-greeting"><div class="csx-msg-content">${formatMessageText(botConfig.greeting_message)}</div><div class="csx-msg-meta"><span class="csx-msg-time"></span></div></div>
                <div class="csx-quick-chips" id="csx-quick-chips"></div>
                <div class="csx-typing" id="csx-typing">
                    <span></span><span></span><span></span>
                </div>
            </div>

            <div class="csx-footer">
                <div class="csx-img-preview" id="csx-img-preview">
                    <img id="csx-preview-img-tag" src="" alt="Preview" />
                    <span id="csx-preview-name">image.jpg</span>
                    <span class="csx-remove-img" id="csx-remove-img" title="Remove image">&times;</span>
                </div>
                <div class="csx-input-row">
                    <input type="file" id="csx-file-input" class="csx-file-input" accept="image/png, image/jpeg, image/webp, image/gif" />
                    <button class="csx-btn-icon" id="csx-attach-btn" title="Attach Image" type="button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                    <textarea class="csx-input" id="csx-input-msg" placeholder="Type a message..." rows="1" wrap="off" aria-label="Type message"></textarea>
                    <button class="csx-send-btn" id="csx-send-btn" title="Send message" type="button">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    shadowRoot.appendChild(widgetContainer);

    // 6. DOM Element Selectors
    const launcherBtn = shadowRoot.getElementById("csx-launcher");
    const chatWindow = shadowRoot.getElementById("csx-window");
    const messagesBox = shadowRoot.getElementById("csx-messages");
    const typingIndicator = shadowRoot.getElementById("csx-typing");
    const msgInput = shadowRoot.getElementById("csx-input-msg");
    const sendBtn = shadowRoot.getElementById("csx-send-btn");
    const fileInput = shadowRoot.getElementById("csx-file-input");
    const attachBtn = shadowRoot.getElementById("csx-attach-btn");
    const imgPreviewBox = shadowRoot.getElementById("csx-img-preview");
    const previewImgTag = shadowRoot.getElementById("csx-preview-img-tag");
    const previewName = shadowRoot.getElementById("csx-preview-name");
    const removeImgBtn = shadowRoot.getElementById("csx-remove-img");
    const botNameEl = shadowRoot.getElementById("csx-bot-name");
    const avatarEl = shadowRoot.getElementById("csx-avatar");
    const greetingEl = shadowRoot.getElementById("csx-greeting");
    const closeBtn = shadowRoot.getElementById("csx-header-close-btn");

    // 7. Utility Functions
    function formatCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? "0" + minutes : minutes;
        return hours + ":" + minutesStr + " " + ampm;
    }

    const doubleBlueTickSvg = '<span class="csx-msg-ticks" title="Read"><svg viewBox="0 0 16 11" width="16" height="11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.05 1.2L4.7 7.55L1.95 4.8L1 5.75L4.7 9.45L12 1.95L11.05 1.2Z" fill="#53bdeb"/><path d="M15.05 1.2L8.7 7.55L7.85 6.7L6.9 7.65L8.7 9.45L16 1.95L15.05 1.2Z" fill="#53bdeb"/></svg></span>';

    function updateGreetingMessage(htmlText) {
        if (!greetingEl) return;
        greetingEl.innerHTML = '<div class="csx-msg-content">' + htmlText + '</div><div class="csx-msg-meta"><span class="csx-msg-time">' + formatCurrentTime() + '</span></div>';
    }

    // Set initial greeting message with formatted time
    updateGreetingMessage(formatMessageText(botConfig.greeting_message));
    applyThemeSettings();

    function formatMessageText(text) {
        if (!text) return "";
        let formatted = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        formatted = formatted.replace(/\*\*([\s\S]*?)\*\*/g, "<strong>$1</strong>");
        formatted = formatted.replace(/__([\s\S]*?)__/g, "<strong>$1</strong>");
        formatted = formatted.replace(/\*([^\*\n]+)\*/g, "<em>$1</em>");
        formatted = formatted.replace(/^[*\-]\s+/gm, "• ");
        formatted = formatted.replace(/\*\*/g, "");
        formatted = formatted.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        formatted = formatted.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        formatted = formatted.replace(/\n{3,}/g, "\n\n");
        formatted = formatted.replace(/\n/g, "<br>");
        return formatted;
    }

    function hexToRgba(hex, alpha) {
        if (!hex) return "rgba(37, 99, 235, " + alpha + ")";
        let cleanHex = hex.replace("#", "").trim();
        if (cleanHex.length === 3) {
            cleanHex = cleanHex.split("").map(c => c + c).join("");
        }
        if (cleanHex.length !== 6) return "rgba(37, 99, 235, " + alpha + ")";
        const intVal = parseInt(cleanHex, 16);
        const r = (intVal >> 16) & 255;
        const g = (intVal >> 8) & 255;
        const b = intVal & 255;
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    }

    function applyThemeSettings() {
        const isWhatsapp = botConfig.widget_theme === "whatsapp";
        const primaryColor = isWhatsapp ? "#25d366" : (botConfig.theme_color || "#2563eb");

        rootEl.style.setProperty("--theme-color", primaryColor);
        widgetContainer.style.setProperty("--theme-color", primaryColor);

        if (isWhatsapp) {
            rootEl.style.setProperty("--pulse-start", "rgba(37, 211, 102, 0.8)");
            rootEl.style.setProperty("--pulse-mid", "rgba(37, 211, 102, 0.35)");
            rootEl.style.setProperty("--pulse-glow", "rgba(37, 211, 102, 0.5)");
            rootEl.style.setProperty("--pulse-end", "rgba(37, 211, 102, 0)");
            rootEl.style.setProperty("--launcher-shadow-base", "rgba(37, 211, 102, 0.4)");
            rootEl.style.setProperty("--launcher-shadow-hover", "rgba(37, 211, 102, 0.55)");

            widgetContainer.style.setProperty("--pulse-start", "rgba(37, 211, 102, 0.8)");
            widgetContainer.style.setProperty("--pulse-mid", "rgba(37, 211, 102, 0.35)");
            widgetContainer.style.setProperty("--pulse-glow", "rgba(37, 211, 102, 0.5)");
            widgetContainer.style.setProperty("--pulse-end", "rgba(37, 211, 102, 0)");
            widgetContainer.style.setProperty("--launcher-shadow-base", "rgba(37, 211, 102, 0.4)");
            widgetContainer.style.setProperty("--launcher-shadow-hover", "rgba(37, 211, 102, 0.55)");
        } else {
            rootEl.style.setProperty("--pulse-start", hexToRgba(primaryColor, 0.75));
            rootEl.style.setProperty("--pulse-mid", hexToRgba(primaryColor, 0.35));
            rootEl.style.setProperty("--pulse-glow", hexToRgba(primaryColor, 0.45));
            rootEl.style.setProperty("--pulse-end", hexToRgba(primaryColor, 0));
            rootEl.style.setProperty("--launcher-shadow-base", hexToRgba(primaryColor, 0.35));
            rootEl.style.setProperty("--launcher-shadow", hexToRgba(primaryColor, 0.35));
            rootEl.style.setProperty("--launcher-shadow-hover", hexToRgba(primaryColor, 0.5));
            rootEl.style.setProperty("--user-bubble-shadow", hexToRgba(primaryColor, 0.25));
            rootEl.style.setProperty("--send-btn-shadow", hexToRgba(primaryColor, 0.3));

            widgetContainer.style.setProperty("--pulse-start", hexToRgba(primaryColor, 0.75));
            widgetContainer.style.setProperty("--pulse-mid", hexToRgba(primaryColor, 0.35));
            widgetContainer.style.setProperty("--pulse-glow", hexToRgba(primaryColor, 0.45));
            widgetContainer.style.setProperty("--pulse-end", hexToRgba(primaryColor, 0));
            widgetContainer.style.setProperty("--launcher-shadow-base", hexToRgba(primaryColor, 0.35));
            widgetContainer.style.setProperty("--launcher-shadow", hexToRgba(primaryColor, 0.35));
            widgetContainer.style.setProperty("--launcher-shadow-hover", hexToRgba(primaryColor, 0.5));
            widgetContainer.style.setProperty("--user-bubble-shadow", hexToRgba(primaryColor, 0.25));
            widgetContainer.style.setProperty("--send-btn-shadow", hexToRgba(primaryColor, 0.3));
        }

        if (botConfig.chat_mode === "dark") {
            widgetContainer.classList.add("csx-mode-dark");
        } else {
            widgetContainer.classList.remove("csx-mode-dark");
        }

        if (isWhatsapp) {
            widgetContainer.classList.add("csx-theme-whatsapp");
        } else {
            widgetContainer.classList.remove("csx-theme-whatsapp");
        }

        // Custom Launcher Icon handling (Icon-Only Mode: Show only icon, hide text)
        const launcherText = shadowRoot.getElementById("csx-launcher-text");
        if (botConfig.launcher_icon) {
            launcherBtn.classList.add("csx-launcher-icon-only");
            if (launcherText) launcherText.style.setProperty("display", "none", "important");

            const currentIcon = shadowRoot.getElementById("csx-launcher-chat-icon");
            if (currentIcon) {
                if (currentIcon.tagName.toLowerCase() === "img") {
                    currentIcon.src = botConfig.launcher_icon;
                } else {
                    const customImg = document.createElement("img");
                    customImg.id = "csx-launcher-chat-icon";
                    customImg.className = "csx-launcher-chat-icon csx-launcher-icon-img";
                    customImg.src = botConfig.launcher_icon;
                    customImg.alt = "Chat";
                    customImg.style.width = "32px";
                    customImg.style.height = "32px";
                    customImg.style.objectFit = "contain";
                    customImg.style.display = "block";
                    currentIcon.parentNode.replaceChild(customImg, currentIcon);
                }
            }
        } else {
            launcherBtn.classList.remove("csx-launcher-icon-only");
            if (launcherText) launcherText.style.display = "";

            if (isWhatsapp) {
                const currentIcon = shadowRoot.getElementById("csx-launcher-chat-icon");
                if (currentIcon && currentIcon.tagName.toLowerCase() !== "svg") {
                    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svgEl.id = "csx-launcher-chat-icon";
                    svgEl.setAttribute("class", "csx-launcher-chat-icon");
                    svgEl.setAttribute("viewBox", "0 0 24 24");
                    svgEl.setAttribute("fill", "none");
                    svgEl.setAttribute("stroke", "none");
                    svgEl.style.width = "24px";
                    svgEl.style.height = "24px";
                    svgEl.innerHTML = '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.004 2C6.48 2 2.004 6.476 2.004 12c0 1.81.484 3.513 1.327 4.982L2.05 21.95l5.12-1.343A9.957 9.957 0 0 0 12.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm5.834 14.288c-.244.686-1.222 1.347-2.003 1.488-.535.096-1.233.173-3.585-.801-3.01-1.246-4.945-4.305-5.095-4.505-.149-.2-1.222-1.626-1.222-3.1 0-1.475.772-2.2 1.045-2.5.274-.3.597-.374.796-.374.199 0 .398.002.572.01.187.01.436-.07.683.523.25.6.846 2.07.92 2.22.075.15.125.324.025.524-.1.2-.15.324-.3.498-.15.175-.315.39-.45.524-.15.149-.306.312-.132.611.175.3.775 1.28 1.662 2.07 1.144 1.02 2.107 1.336 2.406 1.485.3.15.474.125.649-.075.174-.2.747-.872.946-1.171.199-.3.398-.25.672-.15.274.1 1.741.821 2.04.97.299.15.498.224.572.348.075.125.075.723-.169 1.409z" fill="#ffffff"></path>';
                    currentIcon.parentNode.replaceChild(svgEl, currentIcon);
                } else if (currentIcon) {
                    currentIcon.setAttribute("viewBox", "0 0 24 24");
                    currentIcon.setAttribute("fill", "none");
                    currentIcon.setAttribute("stroke", "none");
                    currentIcon.style.width = "24px";
                    currentIcon.style.height = "24px";
                    currentIcon.innerHTML = '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.004 2C6.48 2 2.004 6.476 2.004 12c0 1.81.484 3.513 1.327 4.982L2.05 21.95l5.12-1.343A9.957 9.957 0 0 0 12.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm5.834 14.288c-.244.686-1.222 1.347-2.003 1.488-.535.096-1.233.173-3.585-.801-3.01-1.246-4.945-4.305-5.095-4.505-.149-.2-1.222-1.626-1.222-3.1 0-1.475.772-2.2 1.045-2.5.274-.3.597-.374.796-.374.199 0 .398.002.572.01.187.01.436-.07.683.523.25.6.846 2.07.92 2.22.075.15.125.324.025.524-.1.2-.15.324-.3.498-.15.175-.315.39-.45.524-.15.149-.306.312-.132.611.175.3.775 1.28 1.662 2.07 1.144 1.02 2.107 1.336 2.406 1.485.3.15.474.125.649-.075.174-.2.747-.872.946-1.171.199-.3.398-.25.672-.15.274.1 1.741.821 2.04.97.299.15.498.224.572.348.075.125.075.723-.169 1.409z" fill="#ffffff"></path>';
                }
            } else {
                const currentIcon = shadowRoot.getElementById("csx-launcher-chat-icon");
                if (currentIcon && currentIcon.tagName.toLowerCase() !== "svg") {
                    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svgEl.id = "csx-launcher-chat-icon";
                    svgEl.setAttribute("class", "csx-launcher-chat-icon");
                    svgEl.setAttribute("viewBox", "0 0 24 24");
                    svgEl.setAttribute("fill", "none");
                    svgEl.setAttribute("stroke", "currentColor");
                    svgEl.setAttribute("stroke-width", "2");
                    svgEl.setAttribute("stroke-linecap", "round");
                    svgEl.setAttribute("stroke-linejoin", "round");
                    svgEl.innerHTML = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>';
                    currentIcon.parentNode.replaceChild(svgEl, currentIcon);
                }
            }
        }

        const anim = botConfig.launcher_animation || "pulse";
        launcherBtn.classList.remove("csx-anim-bounce", "csx-anim-pulse");
        if (anim !== "none") {
            launcherBtn.classList.add("csx-anim-" + anim);
        }
    }

    // 8. Fetch Configuration from Laravel Backend
    let configEndpoint = apiHost + "/api/widget-config";
    const queryParams = [];
    if (botToken) queryParams.push("bot_token=" + encodeURIComponent(botToken));
    if (window.location && window.location.hostname) queryParams.push("domain=" + encodeURIComponent(window.location.hostname));
    if (queryParams.length > 0) configEndpoint += "?" + queryParams.join("&");

    fetch(configEndpoint, {
        headers: {
            "X-Bot-ID": botToken
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.is_authorized === false) {
                if (botNameEl) botNameEl.textContent = data.bot_name || "ChatMe.lk AI Agent";
                if (avatarEl) avatarEl.src = data.bot_avatar || apiHost + "/assets/img/chatme-lk-ai-powered-customer-support-chatbot-favicon-compressed.webp";
                if (greetingEl) {
                    const failText = formatMessageText(data.greeting_message || "**Service Inactive / Unauthorized**\n\nThis AI Chatbot service is currently inactive.") + 
                        '<br><br><a href="https://app.chatme.lk" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#2563eb; color:#ffffff; padding:10px 18px; border-radius:10px; text-decoration:none; font-weight:700; font-size:13px; box-shadow:0 4px 10px rgba(37,99,235,0.3);">Contact ChatMe.lk Support</a>';
                    updateGreetingMessage(failText);
                }
                msgInput.disabled = true;
                msgInput.setAttribute("wrap", "off");
                msgInput.placeholder = data.input_placeholder || "Account inactive";
                msgInput.title = data.message || "Chatbot service is inactive or unauthorized.";
                msgInput.style.whiteSpace = "nowrap";
                msgInput.style.overflow = "hidden";
                msgInput.style.textOverflow = "ellipsis";
                msgInput.style.lineHeight = "20px";
                msgInput.style.height = "40px";
                msgInput.style.background = "#f1f5f9";
                msgInput.style.cursor = "not-allowed";
                attachBtn.disabled = true;
                attachBtn.style.opacity = "0.4";
                attachBtn.style.cursor = "not-allowed";
                attachBtn.style.pointerEvents = "none";
                sendBtn.disabled = true;
                sendBtn.style.opacity = "0.4";
                sendBtn.style.cursor = "not-allowed";
            } else if (data && (data.bot_name || data.status === "success")) {
                botConfig = Object.assign(botConfig, data);
                applyThemeSettings();

                if (botNameEl) botNameEl.textContent = botConfig.bot_name;
                if (avatarEl && botConfig.bot_avatar) {
                    avatarEl.onerror = function () {
                        this.onerror = null;
                        this.src = apiHost + "/assets/img/chatme-lk-ai-powered-customer-support-chatbot-favicon-compressed.webp";
                    };
                    avatarEl.src = botConfig.bot_avatar;
                }
                if (greetingEl && botConfig.greeting_message) {
                    updateGreetingMessage(formatMessageText(botConfig.greeting_message));
                }

                // Render Suggestion Chips
                const quickChipsEl = shadowRoot.getElementById("csx-quick-chips");
                if (quickChipsEl && Array.isArray(botConfig.quick_buttons) && botConfig.quick_buttons.length > 0) {
                    quickChipsEl.innerHTML = "";
                    botConfig.quick_buttons.forEach(label => {
                        const chipBtn = document.createElement("button");
                        chipBtn.type = "button";
                        chipBtn.className = "csx-chip-btn";
                        chipBtn.textContent = label;
                        chipBtn.addEventListener("click", () => {
                            msgInput.value = label;
                            adjustTextareaHeight();
                            sendMessage();
                        });
                        quickChipsEl.appendChild(chipBtn);
                    });
                }
            } else if (data && data.message && greetingEl) {
                greetingEl.textContent = data.message;
            }
        })
        .catch(err => console.error("CSX Chatbot Config Load Error:", err));

    // 9. Open / Close Controls
    function openChat() {
        isOpen = true;
        launcherBtn.classList.add("is-open");
        chatWindow.classList.add("is-open");
        setTimeout(() => msgInput.focus(), 160);
    }

    function closeChat() {
        isOpen = false;
        launcherBtn.classList.remove("is-open");
        chatWindow.classList.remove("is-open");
    }

    if (closeBtn) closeBtn.addEventListener("click", closeChat);
    launcherBtn.addEventListener("click", () => {
        if (isOpen) closeChat();
        else openChat();
    });

    function handleLauncherHover() {
        const trig = (botConfig.launcher_trigger || "").toLowerCase();
        if ((trig === "hover" || trig === "on_hover") && !isOpen) {
            openChat();
        }
    }
    ["mouseenter", "mouseover", "pointerenter"].forEach(evt => launcherBtn.addEventListener(evt, handleLauncherHover));

    // 10. File Attachment & Client-side Compression
    attachBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) {
            attachedFile = file;
            previewName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = ev => {
                previewImgTag.src = ev.target.result;
                imgPreviewBox.style.display = "flex";
            };
            reader.readAsDataURL(file);
        }
    });

    removeImgBtn.addEventListener("click", () => {
        attachedFile = null;
        fileInput.value = "";
        imgPreviewBox.style.display = "none";
    });

    function compressImageIfNeeded(file, callback) {
        if (!file || !file.type || !file.type.startsWith("image/")) {
            callback(file);
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                let width = img.width;
                let height = img.height;
                if (width > 1200 || height > 1200) {
                    if (width > height) {
                        height = Math.round((height * 1200) / width);
                        width = 1200;
                    } else {
                        width = Math.round((width * 1200) / height);
                        height = 1200;
                    }
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                canvas.getContext("2d").drawImage(img, 0, 0, width, height);
                canvas.toBlob(blob => {
                    if (blob && blob.size < file.size) {
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: "image/jpeg",
                            lastModified: Date.now()
                        });
                        callback(compressedFile);
                    } else {
                        callback(file);
                    }
                }, "image/jpeg", 0.82);
            };
            img.onerror = () => callback(file);
            img.src = e.target.result;
        };
        reader.onerror = () => callback(file);
        reader.readAsDataURL(file);
    }

    // Auto-adjust textarea height
    function adjustTextareaHeight() {
        if (!msgInput) return;
        const hasNewline = msgInput.value.includes("\n");
        if (hasNewline) {
            msgInput.setAttribute("wrap", "soft");
            msgInput.classList.add("is-multiline");
            msgInput.style.whiteSpace = "pre-wrap";
            msgInput.style.height = "40px";
            const scrollH = msgInput.scrollHeight;
            const newH = Math.min(scrollH, 110);
            msgInput.style.height = Math.max(newH, 40) + "px";
            msgInput.style.overflowY = scrollH > 110 ? "auto" : "hidden";
        } else {
            msgInput.setAttribute("wrap", "off");
            msgInput.classList.remove("is-multiline");
            msgInput.style.whiteSpace = "nowrap";
            msgInput.style.height = "40px";
            msgInput.style.overflowY = "hidden";
        }
    }
    msgInput.addEventListener("input", adjustTextareaHeight);

    // 11. Send Message Engine
    function sendMessage() {
        const text = msgInput.value.trim();
        if ((!text && !attachedFile) || isSending) return;

        isSending = true;
        sendBtn.disabled = true;

        const userMsgDiv = document.createElement("div");
        userMsgDiv.className = "csx-msg csx-msg-user";

        if (attachedFile) {
            const imgEl = document.createElement("img");
            imgEl.className = "csx-msg-img";
            imgEl.src = URL.createObjectURL(attachedFile);
            userMsgDiv.appendChild(imgEl);
        }

        if (text) {
            const textEl = document.createElement("div");
            textEl.className = "csx-msg-content";
            textEl.textContent = text;
            userMsgDiv.appendChild(textEl);
        }

        const userMeta = document.createElement("div");
        userMeta.className = "csx-msg-meta";
        userMeta.innerHTML = '<span class="csx-msg-time">' + formatCurrentTime() + '</span>' + doubleBlueTickSvg;
        userMsgDiv.appendChild(userMeta);

        messagesBox.appendChild(userMsgDiv);
        messagesBox.scrollTop = messagesBox.scrollHeight;

        const fileToSend = attachedFile;
        const textToSend = text;

        msgInput.value = "";
        adjustTextareaHeight();
        attachedFile = null;
        fileInput.value = "";
        imgPreviewBox.style.display = "none";

        typingIndicator.style.display = "flex";
        messagesBox.appendChild(typingIndicator);
        messagesBox.scrollTop = messagesBox.scrollHeight;

        compressImageIfNeeded(fileToSend, preparedFile => {
            const formData = new FormData();
            formData.append("session_id", sessionId);
            formData.append("message", textToSend);
            if (botToken) formData.append("bot_token", botToken);
            if (window.location && window.location.hostname) formData.append("domain", window.location.hostname);
            if (preparedFile) formData.append("image", preparedFile);

            fetch(apiHost + "/api/chat", {
                method: "POST",
                headers: {
                    "X-Bot-ID": botToken
                },
                body: formData
            })
                .then(async res => {
                    let data = null;
                    try {
                        data = await res.json();
                    } catch (e) {}
                    if (!res.ok) {
                        const errMsg = (data && data.message) ? data.message : ("HTTP " + res.status);
                        throw new Error(errMsg);
                    }
                    return data;
                })
                .then(data => {
                    typingIndicator.style.display = "none";
                    isSending = false;
                    sendBtn.disabled = false;

                    const botMsgDiv = document.createElement("div");
                    botMsgDiv.className = "csx-msg csx-msg-bot";

                    const botContent = document.createElement("div");
                    botContent.className = "csx-msg-content";
                    if (data && data.status === "success") {
                        botContent.innerHTML = formatMessageText(data.reply);
                    } else {
                        botContent.textContent = (data && data.message) ? data.message : "An error occurred while connecting to AI.";
                        botMsgDiv.style.color = "#ef4444";
                    }
                    botMsgDiv.appendChild(botContent);

                    const botMeta = document.createElement("div");
                    botMeta.className = "csx-msg-meta";
                    botMeta.innerHTML = '<span class="csx-msg-time">' + formatCurrentTime() + '</span>';
                    botMsgDiv.appendChild(botMeta);

                    messagesBox.appendChild(botMsgDiv);
                    messagesBox.scrollTop = messagesBox.scrollHeight;
                })
                .catch(err => {
                    typingIndicator.style.display = "none";
                    isSending = false;
                    sendBtn.disabled = false;

                    const botMsgDiv = document.createElement("div");
                    botMsgDiv.className = "csx-msg csx-msg-bot";
                    botMsgDiv.style.color = "#ef4444";

                    const botContent = document.createElement("div");
                    botContent.className = "csx-msg-content";
                    botContent.textContent = err.message || "Connection error. Please try again.";
                    botMsgDiv.appendChild(botContent);

                    const botMeta = document.createElement("div");
                    botMeta.className = "csx-msg-meta";
                    botMeta.innerHTML = '<span class="csx-msg-time">' + formatCurrentTime() + '</span>';
                    botMsgDiv.appendChild(botMeta);

                    messagesBox.appendChild(botMsgDiv);
                    messagesBox.scrollTop = messagesBox.scrollHeight;
                });
        });
    }

    sendBtn.addEventListener("click", sendMessage);

    // Multiline: Shift+Enter creates a new line, Enter sends
    msgInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.keyCode === 13) {
            if (e.shiftKey) {
                setTimeout(adjustTextareaHeight, 10);
            } else {
                e.preventDefault();
                sendMessage();
            }
        }
    });

    // 12. Public JavaScript Global API
    window.CSXChatbot = {
        open: function (theme) {
            if (theme) this.setTheme(theme);
            openChat();
        },
        close: function () {
            closeChat();
        },
        toggle: function (theme) {
            if (isOpen) this.close();
            else this.open(theme);
        },
        setTheme: function (theme) {
            botConfig.widget_theme = theme;
            applyThemeSettings();
        },
        setMode: function (mode) {
            botConfig.chat_mode = mode;
            applyThemeSettings();
        },
        setColor: function (color) {
            botConfig.theme_color = color;
            applyThemeSettings();
        },
        sendMessage: function (text) {
            if (!text || !msgInput) return;
            msgInput.value = text;
            adjustTextareaHeight();
            sendMessage();
        }
    };
})();
