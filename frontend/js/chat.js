// ============================================================
// chat.js — Chat State & Message Management
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

  // ── DOM References ─────────────────────────────────────────
  const messagesContainer = () => $('#messages-container');
  const welcomeScreen    = () => $('#welcome-screen');
  const typingIndicator  = () => $('#typing-indicator');
  const chatInput        = () => $('#chat-input');
  const sendBtn          = () => $('#send-btn');
  const charCount        = () => $('#char-count');

  // ── Show/Hide Welcome Screen ───────────────────────────────
  function setWelcomeVisible(visible) {
    const ws = welcomeScreen();
    const mc = messagesContainer();
    if (ws) ws.style.display = visible ? 'flex' : 'none';
    if (mc) mc.style.display = visible ? 'none' : 'flex';
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
  }

  // ── Add AI Message ─────────────────────────────────────────
  function addAIMessage(response, rawText = '') {
    messages.push({
      role: 'assistant',
      content: rawText || response.message || JSON.stringify(response),
    });
    appendMessage(renderAIMessage(response, rawText));
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

      // Extract raw text for history
      let rawText = '';
      if (response.type === 'structured' && response.data) {
        rawText = JSON.stringify(response.data);
      } else {
        rawText = response.message || '';
      }

      addAIMessage(response, rawText);
    } catch (error) {
      // Show error in chat
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
    setWelcomeVisible(true);
    showToast('Conversation cleared', 'info', 2000);
  }

  // ── Initialize Chat ────────────────────────────────────────
  function init() {
    setWelcomeVisible(true);

    const form = $('#chat-form');
    const input = chatInput();

    if (!form || !input) return;

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submit(input.value);
    });

    // Auto-resize textarea as user types
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 200) + 'px';
      updateCharCount(input.value.length);
      updateSendBtn(input.value);
    });

    // Ctrl+Enter or Enter to submit (Shift+Enter for newline)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn()?.disabled) {
          submit(input.value);
        }
      }
    });

    // Suggestion chips — click to fill input and submit
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

    // Clear chat button
    const clearBtn = $('#clear-chat-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearChat);
    }

    // New chat button
    const newChatBtn = $('#new-chat-btn');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', clearChat);
    }
  }

  return { init, submit, clearChat };
})();

window.Chat = Chat;
