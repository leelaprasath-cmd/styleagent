// ============================================================
// chat.js — Chat State & Message Management (Firebase Enabled)
// Manages the conversation, sends messages, handles responses
// ============================================================

'use strict';

const Chat = (() => {
  const { $, formatTime, copyToClipboard } = window.StyleAgentUtils;
  const { sendMessage } = window.API;
  const { renderUserMessage, renderAIMessage, showToast } = window.Renderer;

  // ── State ──────────────────────────────────────────────────
  let messages = []; // Full conversation history
  let isLoading = false;
  let sessionId = localStorage.getItem('styleagent_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('styleagent_session_id', sessionId);
  }

  // ── DOM References ─────────────────────────────────────────
  const messagesContainer = () => $('#messages-container');
  const welcomeScreen    = () => $('#welcome-screen');
  const typingIndicator  = () => $('#typing-indicator');
  const chatInput        = () => $('#chat-input');
  const sendBtn          = () => $('#send-btn');
  const charCount        = () => $('#char-count');

  // ── Local Storage Helpers ────────────────────────────────────
  function saveHistoryLocal() {
    try {
      localStorage.setItem(sessionId, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat to local storage", e);
    }
  }

  function loadHistoryLocal() {
    try {
      const saved = localStorage.getItem(sessionId);
      if (saved) {
        const history = JSON.parse(saved);
        if (history.length > 0) {
          messages = [];
          const container = messagesContainer();
          if (container) container.innerHTML = '';
          setWelcomeVisible(false);

          history.forEach(msg => {
            if (msg.role === 'user') {
              messages.push({ role: 'user', content: msg.content });
              appendMessage(renderUserMessage(msg.content));
            } else {
              let parsedContent = msg.content;
              try { parsedContent = JSON.parse(msg.content); } catch(e){}
              messages.push({ role: 'assistant', content: msg.content });
              appendMessage(renderAIMessage(parsedContent, msg.content));
            }
          });
        }
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  }

  // ── Show/Hide Welcome Screen ───────────────────────────────
  function setWelcomeVisible(visible) {
    const ws = welcomeScreen();
    const mc = messagesContainer();
    if (ws) ws.style.display = visible ? 'flex' : 'none';
    if (mc) {
      mc.style.display = visible ? 'none' : 'flex';
      mc.style.flexDirection = 'column';
    }
  }

  // ── Scroll to Bottom ───────────────────────────────────────
  function scrollToBottom() {
    const chatArea = $('#chat-area');
    if (chatArea) {
      chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
    }
  }

  // ── Show / Hide Typing Indicator ───────────────────────────
  function setTyping(visible) {
    const ti = typingIndicator();
    if (!ti) return;
    if (visible) {
      ti.classList.remove('hidden');
      scrollToBottom();
    } else {
      ti.classList.add('hidden');
    }
  }

  // ── Set Loading State ──────────────────────────────────────
  function setLoading(loading) {
    isLoading = loading;
    const input = chatInput();
    const btn = sendBtn();
    if (input) input.disabled = loading;
    if (btn) btn.disabled = loading;
    setTyping(loading);
  }

  // ── Append Message to DOM ──────────────────────────────────
  function appendMessage(html) {
    const container = messagesContainer();
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const el = wrapper.firstElementChild;
    container.appendChild(el);

    // Bind copy buttons in the new message
    el.querySelectorAll('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.getAttribute('data-text');
        const success = await copyToClipboard(text);
        if (success) {
          showToast('Copied to clipboard!', 'success', 2000);
          btn.innerHTML = '<i class="bx bx-check" aria-hidden="true"></i> Copied!';
          setTimeout(() => {
            btn.innerHTML = '<i class="bx bx-copy" aria-hidden="true"></i> Copy';
          }, 2000);
        }
      });
    });

    scrollToBottom();
  }

  // ── Add User Message ───────────────────────────────────────
  function addUserMessage(content) {
    messages.push({ role: 'user', content });
    setWelcomeVisible(false);
    appendMessage(renderUserMessage(content));
    saveHistoryLocal();
  }

  // ── Add AI Message ─────────────────────────────────────────
  function addAIMessage(response, rawText = '') {
    messages.push({
      role: 'assistant',
      content: rawText || response.message || JSON.stringify(response),
    });
    appendMessage(renderAIMessage(response, rawText));
    saveHistoryLocal();
  }

  // ── Submit a Message ───────────────────────────────────────
  async function submit(content) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    // Clear input
    const input = chatInput();
    if (input) {
      input.value = '';
      input.style.height = 'auto';
      updateCharCount(0);
      updateSendBtn('');
    }

    // Render user message immediately
    addUserMessage(trimmed);
    setLoading(true);

    try {
      const data = await sendMessage(messages);
      const response = data.response;

      let rawText = '';
      if (response.type === 'structured' && response.data) {
        rawText = JSON.stringify(response.data);
      } else {
        rawText = response.message || '';
      }

      addAIMessage(response, rawText);
    } catch (error) {
      addAIMessage(
        {
          type: 'conversational',
          message: `⚠️ **Error:** ${error.message}\n\nPlease check your internet connection and try again.`,
        },
        error.message
      );
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
      scrollToBottom();
      if (chatInput()) chatInput().focus();
    }
  }

  // ── Update Character Count ─────────────────────────────────
  function updateCharCount(length) {
    const cc = charCount();
    if (!cc) return;
    cc.textContent = `${length} / 4000`;
    cc.style.color = length > 3500 ? 'var(--warning)' : '';
  }

  // ── Update Send Button State ───────────────────────────────
  function updateSendBtn(value) {
    const btn = sendBtn();
    if (btn) btn.disabled = !value.trim() || isLoading;
  }

  // ── Clear Chat ─────────────────────────────────────────────
  function clearChat() {
    messages = [];
    const container = messagesContainer();
    if (container) container.innerHTML = '';
    
    // Generate new session ID to "clear" chat in Firebase context
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('styleagent_session_id', sessionId);
    
    setWelcomeVisible(true);
    showToast('Conversation cleared', 'info', 2000);
  }

  // ── Initialize Chat ────────────────────────────────────────
  async function init() {
    loadHistoryLocal();
    if (messages.length === 0) {
      setWelcomeVisible(true);
    }

    const form = $('#chat-form');
    const input = chatInput();

    if (!form || !input) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submit(input.value);
    });

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 200) + 'px';
      updateCharCount(input.value.length);
      updateSendBtn(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn()?.disabled) {
          submit(input.value);
        }
      }
    });

    document.querySelectorAll('.suggestion-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt && input) {
          input.value = prompt;
          updateCharCount(prompt.length);
          updateSendBtn(prompt);
          submit(prompt);
        }
      });
    });

    const clearBtn = $('#clear-chat-btn');
    if (clearBtn) clearBtn.addEventListener('click', clearChat);

    const newChatBtn = $('#new-chat-btn');
    if (newChatBtn) newChatBtn.addEventListener('click', clearChat);
  }

  return { init, submit, clearChat };
})();

window.Chat = Chat;
