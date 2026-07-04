/**
 * landing.js - Handles Parallax and Scroll Reveal effects for the Landing Page
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Reveal (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };
  
    const revealObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('active');
        // Stop observing once revealed
        observer.unobserve(entry.target);
      });
    }, revealOptions);
  
    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  
    // 2. Handle "Get Started" buttons
    const startBtns = document.querySelectorAll('.start-chat-btn');
    const landingPage = document.getElementById('landing-page');
    const appLayout = document.getElementById('app-layout');
  
    startBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Hide landing page with CSS transition
        landingPage.classList.add('hidden');
        
        // Wait for fade out, then hide completely and show app
        setTimeout(() => {
          landingPage.style.display = 'none';
          appLayout.classList.remove('hidden');
          
          // Optionally auto-focus chat input
          const chatInput = document.getElementById('chat-input');
          if(chatInput) {
             chatInput.focus();
          }
        }, 500); // matches transition time in landing.css
      });
    });
  });
