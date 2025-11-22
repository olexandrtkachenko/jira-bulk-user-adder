// Jira Bulk User Adder - Content Script

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    WAIT_FOR_DROPDOWN_TIMEOUT: 15000,  // Max time to wait for users to load (15s)
    WAIT_FOR_CLEAR_TIMEOUT: 10000,     // Max time to wait for input to clear (10s)
    POLL_INTERVAL: 150,                // How often to check for elements (150ms)
    DELAY_AFTER_INPUT: 400,            // Delay after entering email (400ms)
    DELAY_AFTER_SELECT: 600,           // Delay after selection (600ms)
    DELAY_BETWEEN_USERS: 500           // Delay between users (500ms)
  };

  let isProcessing = false;
  let currentProcessIndex = 0;

  // Find the React Select input field
  function findReactSelectInput() {
    // Try multiple selectors to find the input
    const selectors = [
      'input[placeholder*="Search by name or email"]',
      'input[id^="react-select-"]',
      'input[aria-autocomplete="list"]',
      '[class*="select"] input[type="text"]'
    ];

    for (const selector of selectors) {
      const input = document.querySelector(selector);
      if (input) {
        console.log('[Jira Bulk] Found input:', selector);
        return input;
      }
    }

    return null;
  }

  // Trigger React events on input - FAST VERSION
  function triggerReactChange(element, value) {
    // Set value using native setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set;
    nativeInputValueSetter.call(element, value);

    // Trigger only essential events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Wait for autocomplete dropdown with users to appear - Universal for all Jira types
  async function waitForAutocompleteDropdown(timeout = CONFIG.WAIT_FOR_DROPDOWN_TIMEOUT) {
    const startTime = Date.now();
    
    const dropdownSelectors = [
      // Atlassian Cloud
      '[data-testid*="menu"]',
      '[data-testid*="dropdown"]',
      'div[class*="menu"][class*="container"]',
      
      // Classic Jira
      '[id^="react-select-"][id*="-listbox"]',
      '[class*="select"][class*="menu"]',
      '[role="listbox"]',
      '[class*="dropdown"][class*="menu"]',
      'div[class*="MenuList"]',
      
      // Generic
      'ul[role="listbox"]',
      'div[role="menu"]',
      '[class*="suggestions"]',
      '[class*="autocomplete"]'
    ];
    
    const optionSelectors = [
      // Atlassian Cloud
      '[data-testid*="option"]',
      'button[role="option"]',
      
      // Classic Jira
      '[role="option"]',
      'div[id^="react-select-"][id*="-option-"]',
      '[class*="option"]',
      
      // Generic
      'li[role="option"]',
      'div[class*="item"]',
      'li[class*="suggestion"]'
    ];

    let attempts = 0;
    let foundDropdown = false;
    
    while (Date.now() - startTime < timeout) {
      attempts++;
      
      // Log progress
      if (attempts % 10 === 0) {
        console.log('[Jira Bulk] ⏳ Attempt', attempts, '- Dropdown:', foundDropdown);
      }
      
      // Try to find dropdown
      let dropdown = null;
      for (const selector of dropdownSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          // Check if visible
          if (element.offsetParent !== null) {
            dropdown = element;
            if (!foundDropdown) {
              console.log('[Jira Bulk] 📦 Found dropdown:', selector);
              foundDropdown = true;
            }
            break;
          }
        }
        if (dropdown) break;
      }
      
      // Check if dropdown has users
      if (dropdown) {
        for (const selector of optionSelectors) {
          const options = dropdown.querySelectorAll(selector);
          if (options.length > 0) {
            // Verify options are visible and have text
            const visibleOptions = Array.from(options).filter(opt => 
              opt.offsetParent !== null && opt.textContent.trim().length > 0
            );
            
            if (visibleOptions.length > 0) {
              const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
              console.log('[Jira Bulk] ✅ Users loaded after', attempts, 'attempts (', elapsed, 'seconds)');
              console.log('[Jira Bulk] 👥 Found', visibleOptions.length, 'users');
              console.log('[Jira Bulk] 🎯 First user:', visibleOptions[0].textContent.trim().substring(0, 50));
              return dropdown;
            }
          }
        }
      }
      
      await sleep(CONFIG.POLL_INTERVAL);
    }

    // Debug info on timeout
    console.error('[Jira Bulk] ❌ Timeout after', timeout, 'ms');
    console.error('[Jira Bulk] 🐛 DEBUG: Searching for any dropdowns/menus on page:');
    const allMenus = document.querySelectorAll('[role="menu"], [role="listbox"], div[class*="menu"], div[class*="dropdown"]');
    allMenus.forEach((menu, index) => {
      if (menu.offsetParent !== null) {
        console.log(`  ${index + 1}.`, {
          tagName: menu.tagName,
          role: menu.getAttribute('role'),
          className: menu.className,
          children: menu.children.length
        });
      }
    });
    
    return null;
  }
  
  // Wait for input to be cleared after selection
  async function waitForInputClear(input, timeout = CONFIG.WAIT_FOR_CLEAR_TIMEOUT) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (!input.value || input.value.trim() === '') {
        console.log('[Jira Bulk] Input cleared');
        return true;
      }
      await sleep(CONFIG.POLL_INTERVAL);
    }
    
    console.warn('[Jira Bulk] Input clear timeout');
    return false;
  }

  // Find and click the first option in autocomplete
  async function selectFirstOption(dropdown) {
    if (!dropdown) {
      console.warn('[Jira Bulk] No dropdown provided');
      return false;
    }

    // Try to find the first option
    const optionSelectors = [
      '[role="option"]',
      '[class*="option"]',
      'div[id^="react-select-"][id*="-option-"]'
    ];

    for (const selector of optionSelectors) {
      const options = dropdown.querySelectorAll(selector);
      if (options.length > 0) {
        const firstOption = options[0];
        console.log('[Jira Bulk] 🎯 Clicking first option:', firstOption.textContent.trim());
        
        // Try multiple event types to ensure React catches it
        firstOption.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        await sleep(50);
        firstOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        await sleep(50);
        firstOption.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        await sleep(50);
        firstOption.click();
        
        return true;
      }
    }

    console.warn('[Jira Bulk] No options found in dropdown');
    return false;
  }

  // Sleep utility
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Process a single email
  async function processSingleEmail(email, index, total) {
    console.log('[Jira Bulk] 📧 Processing email', index + 1, 'of', total, ':', email);
    updateStatus(`Processing ${index + 1}/${total}: ${email}`, 'processing');

    const input = findReactSelectInput();
    if (!input) {
      console.error('[Jira Bulk] ❌ Jira input field not found!');
      throw new Error('Input field not found. Please refresh the page.');
    }
    console.log('[Jira Bulk] ✅ Found Jira input field');

    // Focus the input
    input.focus();
    await sleep(100);

    // Clear existing value if needed
    if (input.value) {
      console.log('[Jira Bulk] 🧹 Clearing previous value');
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(200);
    }

    // Enter the email in one go
    console.log('[Jira Bulk] ⌨️  Entering email:', email);
    triggerReactChange(input, email);
    
    // Wait for React to process
    await sleep(CONFIG.DELAY_AFTER_INPUT);
    
    console.log('[Jira Bulk] ✅ Email entered, current value:', input.value);
    console.log('[Jira Bulk] ⏳ Waiting for Jira to load users...');

    // Smart wait for users to load in dropdown
    const dropdown = await waitForAutocompleteDropdown();

    if (!dropdown) {
      console.warn('[Jira Bulk] ⚠️ Dropdown did not appear for:', email);
      updateStatus(`⚠️ No autocomplete result for: ${email}`, 'warning');
      // Try to clear for next iteration
      triggerReactChange(input, '');
      await sleep(CONFIG.DELAY_BETWEEN_USERS);
      return false;
    }

    console.log('[Jira Bulk] ✅ Dropdown appeared, selecting first option...');
    
    // Select the first option (pass dropdown as parameter)
    const selected = await selectFirstOption(dropdown);

    if (!selected) {
      console.warn('[Jira Bulk] ⚠️ Could not select option for:', email);
      updateStatus(`⚠️ Could not select user for: ${email}`, 'warning');
      triggerReactChange(input, '');
      await sleep(CONFIG.DELAY_BETWEEN_USERS);
      return false;
    }

    console.log('[Jira Bulk] ✅ Option selected');
    console.log('[Jira Bulk] ⏱️ Waiting for Jira to process...');
    
    // Initial delay after selection
    await sleep(CONFIG.DELAY_AFTER_SELECT);
    
    // Wait for input to clear (indicates successful addition)
    const cleared = await waitForInputClear(input);
    
    if (cleared) {
      console.log('[Jira Bulk] ✅ User successfully added:', email);
      updateStatus(`✅ Added: ${email}`, 'success');
    } else {
      console.warn('[Jira Bulk] ⚠️ Could not verify clearing, assuming success');
      updateStatus(`⚠️ Likely added: ${email}`, 'warning');
    }
    
    // Extra delay before next user
    console.log('[Jira Bulk] 💤 Delay before next user...');
    await sleep(CONFIG.DELAY_BETWEEN_USERS);

    return true;
  }

  // Process the email list
  async function processEmailList(emailList) {
    if (isProcessing) {
      alert('Already processing. Please wait...');
      return;
    }

    const emails = emailList
      .split('\n')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (emails.length === 0) {
      alert('Please enter at least one email address.');
      return;
    }

    isProcessing = true;
    currentProcessIndex = 0;

    const processBtn = document.getElementById('bulk-process-btn');
    const stopBtn = document.getElementById('bulk-stop-btn');
    if (processBtn) processBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;

    const startTime = Date.now();
    const results = {
      total: emails.length,
      successful: [],
      failed: []
    };

    updateStatus(`🚀 Starting processing ${emails.length} emails...`, 'info');

    try {
      for (let i = 0; i < emails.length; i++) {
        if (!isProcessing) {
          updateStatus('⏸️ Stopped by user', 'warning');
          break;
        }

        currentProcessIndex = i;
        const email = emails[i];

        try {
          console.log('[Jira Bulk] 🔄 Starting processing for:', email);
          updateStatus(`📧 Processing ${i + 1} of ${emails.length}: ${email}`, 'info');
          
          const success = await processSingleEmail(email, i, emails.length);
          
          if (success) {
            results.successful.push(email);
            console.log('[Jira Bulk] ✅ Successfully processed:', email);
          } else {
            results.failed.push(email);
            console.log('[Jira Bulk] ⚠️ Failed to process:', email);
          }

          await sleep(CONFIG.DELAY_BETWEEN_USERS);
        } catch (error) {
          console.error('[Jira Bulk] ❌ Exception processing email:', email);
          console.error('[Jira Bulk] ❌ Error details:', error);
          console.error('[Jira Bulk] ❌ Stack trace:', error.stack);
          updateStatus(`❌ Error with ${email}: ${error.message}`, 'error');
          results.failed.push(email);
          await sleep(CONFIG.DELAY_BETWEEN_USERS);
        }
      }

      const endTime = Date.now();
      const totalTime = ((endTime - startTime) / 1000).toFixed(1);
      
      showSummary(results, totalTime);
    } finally {
      isProcessing = false;
      if (processBtn) processBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
    }
  }

  // Stop processing
  function stopProcessing() {
    if (isProcessing) {
      isProcessing = false;
      updateStatus('⏸️ Stopping...', 'warning');
    }
  }

  // Update status message
  function updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('bulk-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `bulk-status bulk-status-${type}`;
    }
  }

  // Show summary after processing
  function showSummary(results, totalTime) {
    const statusDiv = document.getElementById('bulk-status');
    if (!statusDiv) return;

    const successCount = results.successful.length;
    const failCount = results.failed.length;
    const processedCount = successCount + failCount;
    
    const avgTime = processedCount > 0 ? (parseFloat(totalTime) / processedCount).toFixed(1) : 0;
    
    let summaryHTML = `
      <div style="text-align: left; padding: 10px; line-height: 1.8;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #0052cc;">
          📊 Summary
        </div>
        
        <div style="margin-bottom: 8px;">
          ✅ <strong>Successfully added:</strong> ${successCount} of ${results.total}
        </div>
        
        <div style="margin-bottom: 8px;">
          ⏱️ <strong>Total time:</strong> ${totalTime} seconds
        </div>
        
        <div style="margin-bottom: 8px;">
          ⚡ <strong>Average time per user:</strong> ${avgTime} seconds
        </div>
    `;
    
    if (failCount > 0) {
      summaryHTML += `
        <div style="margin-top: 15px; padding: 10px; background: #ffebe6; border-radius: 4px; border-left: 3px solid #de350b;">
          <div style="font-weight: bold; color: #de350b; margin-bottom: 8px;">
            ❌ Failed to add (${failCount}):
          </div>
          <div style="font-family: monospace; font-size: 12px; color: #172b4d;">
    `;
      
      results.failed.forEach(email => {
        summaryHTML += `• ${email}<br>`;
      });
      
      summaryHTML += `
          </div>
        </div>
      `;
    }
    
    summaryHTML += '</div>';
    
    statusDiv.innerHTML = summaryHTML;
    statusDiv.className = 'bulk-status ' + (failCount > 0 ? 'bulk-status-warning' : 'bulk-status-success');
    
    console.log('[Jira Bulk] ==================== SUMMARY ====================');
    console.log('[Jira Bulk] ✅ Successfully added:', successCount, 'of', results.total);
    console.log('[Jira Bulk] ⏱️  Total time:', totalTime, 'seconds');
    console.log('[Jira Bulk] ⚡ Average time per user:', avgTime, 'seconds');
    
    if (failCount > 0) {
      console.log('[Jira Bulk] ❌ Failed emails:');
      results.failed.forEach(email => {
        console.log('[Jira Bulk]    •', email);
      });
    }
    
    console.log('[Jira Bulk] ====================================================');
  }

  // Create a floating button to show UI
  function createFloatingButton() {
    if (document.getElementById('bulk-floating-btn')) {
      return;
    }

    const floatingBtn = document.createElement('div');
    floatingBtn.id = 'bulk-floating-btn';
    floatingBtn.className = 'bulk-floating-btn';
    floatingBtn.innerHTML = '📧';
    floatingBtn.title = 'Jira Bulk User Adder';
    
    floatingBtn.addEventListener('click', () => {
      toggleUI();
    });
    
    document.body.appendChild(floatingBtn);
    console.log('[Jira Bulk] Floating button created');
  }

  // Create the UI
  function createBulkUI() {
    // Check if already exists
    if (document.getElementById('bulk-user-container')) {
      console.log('[Jira Bulk] UI already exists');
      return;
    }
    
    console.log('[Jira Bulk] Creating UI panel');

    const container = document.createElement('div');
    container.id = 'bulk-user-container';
    container.className = 'bulk-user-container';

    container.innerHTML = `
      <div class="bulk-header" title="Drag to move">
        <h3>📧 Bulk Add Users</h3>
        <button id="bulk-toggle-btn" class="bulk-btn-small">Hide</button>
      </div>
      
      <div id="bulk-content" class="bulk-content">
        <div class="bulk-input-section">
          <label for="bulk-email-input">
            Enter email addresses (one per line):
          </label>
          <textarea 
            id="bulk-email-input" 
            class="bulk-textarea"
            placeholder="user1@example.com
user2@example.com
user3@example.com"
            rows="8"
          ></textarea>
        </div>

        <div class="bulk-controls">
          <button id="bulk-process-btn" class="bulk-btn bulk-btn-primary">
            ▶️ Start Processing
          </button>
          <button id="bulk-stop-btn" class="bulk-btn bulk-btn-danger" disabled>
            ⏸️ Stop
          </button>
          <button id="bulk-clear-btn" class="bulk-btn bulk-btn-secondary">
            🗑️ Clear
          </button>
        </div>

        <div id="bulk-status" class="bulk-status">
          Ready to process emails
        </div>

        <div class="bulk-settings">
          <details>
            <summary>⚙️ Settings</summary>
            <div class="bulk-settings-content">
              <label>
                Max wait for users (sec):
                <input type="number" id="bulk-dropdown-timeout" value="${CONFIG.WAIT_FOR_DROPDOWN_TIMEOUT / 1000}" min="5" max="30" step="5">
              </label>
              <label>
                Delay after select (ms):
                <input type="number" id="bulk-delay-select" value="${CONFIG.DELAY_AFTER_SELECT}" min="100" max="3000" step="100">
              </label>
              <label>
                Delay between users (ms):
                <input type="number" id="bulk-delay-between" value="${CONFIG.DELAY_BETWEEN_USERS}" min="100" max="3000" step="100">
              </label>
              <small style="color: #666; display: block; margin-top: 8px;">
                ℹ️ Plugin waits for Jira to load users automatically (max 15 sec)
              </small>
            </div>
          </details>
        </div>
        
        <div class="bulk-footer">
          <small>
            👨‍💻 Created by: <a href="mailto:Oleksandr_Tkachenko@outlook.com" class="bulk-author-link">Oleksandr Tkachenko</a>
          </small>
        </div>
      </div>
    `;

    // Insert at the top of the page
    document.body.insertBefore(container, document.body.firstChild);

    // Add event listeners
    document.getElementById('bulk-toggle-btn').addEventListener('click', toggleBulkUI);
    document.getElementById('bulk-process-btn').addEventListener('click', startProcessing);
    document.getElementById('bulk-stop-btn').addEventListener('click', stopProcessing);
    document.getElementById('bulk-clear-btn').addEventListener('click', clearInput);
    
    // Selective focus management - only for textarea
    const textarea = document.getElementById('bulk-email-input');
    if (textarea) {
      console.log('[Jira Bulk] 📝 Setting up textarea with smart focus');
      
      // Only stop propagation for textarea itself, not the whole container
      let isTyping = false;
      
      textarea.addEventListener('mousedown', (e) => {
        // Only block if clicking directly on textarea
        if (e.target === textarea) {
          e.stopPropagation();
        }
      }, true);
      
      textarea.addEventListener('click', (e) => {
        if (e.target === textarea) {
          e.stopPropagation();
        }
      }, true);
      
      // Track when user is actively typing
      textarea.addEventListener('focus', () => {
        isTyping = true;
        console.log('[Jira Bulk] ✅ Textarea focused');
      });
      
      textarea.addEventListener('blur', () => {
        isTyping = false;
        console.log('[Jira Bulk] 📝 Textarea blurred');
      });
      
      // Only protect focus if user is actively hovering over textarea
      textarea.addEventListener('mouseenter', () => {
        if (!isTyping) {
          textarea.focus();
          console.log('[Jira Bulk] 🎯 Auto-focused on hover');
        }
      });
      
      console.log('[Jira Bulk] ✅ Textarea ready');
    }

    // Settings listeners
    document.getElementById('bulk-dropdown-timeout').addEventListener('change', (e) => {
      CONFIG.WAIT_FOR_DROPDOWN_TIMEOUT = parseInt(e.target.value) * 1000; // Convert seconds to ms
    });
    document.getElementById('bulk-delay-select').addEventListener('change', (e) => {
      CONFIG.DELAY_AFTER_SELECT = parseInt(e.target.value);
    });
    document.getElementById('bulk-delay-between').addEventListener('change', (e) => {
      CONFIG.DELAY_BETWEEN_USERS = parseInt(e.target.value);
    });

    // Make container draggable
    makeDraggable(container);

    console.log('[Jira Bulk] UI created successfully');
    
    return container;
  }

  // Make element draggable by header
  function makeDraggable(element) {
    const header = element.querySelector('.bulk-header');
    if (!header) return;

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    header.addEventListener('mousedown', dragStart);

    function dragStart(e) {
      // Get initial mouse position
      initialX = e.clientX;
      initialY = e.clientY;

      // Get current element position
      const rect = element.getBoundingClientRect();
      currentX = rect.left;
      currentY = rect.top;

      isDragging = true;
      element.classList.add('dragging');

      // Add listeners to document
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);

      console.log('[Jira Bulk] 🖱️ Dragging started');
    }

    function drag(e) {
      if (!isDragging) return;

      e.preventDefault();

      // Calculate new position
      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;

      const newX = currentX + deltaX;
      const newY = currentY + deltaY;

      // Update element position
      element.style.left = newX + 'px';
      element.style.top = newY + 'px';
      element.style.right = 'auto';
      element.style.transform = 'none';
    }

    function dragEnd() {
      if (!isDragging) return;

      isDragging = false;
      element.classList.remove('dragging');

      // Remove listeners
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', dragEnd);

      // Save position to localStorage
      const rect = element.getBoundingClientRect();
      localStorage.setItem('jiraBulkPosition', JSON.stringify({
        left: rect.left,
        top: rect.top
      }));

      console.log('[Jira Bulk] 📍 Position saved');
    }
  }

  // Restore saved position
  function restorePosition(element) {
    const saved = localStorage.getItem('jiraBulkPosition');
    if (saved) {
      try {
        const { left, top } = JSON.parse(saved);
        element.style.left = left + 'px';
        element.style.top = top + 'px';
        element.style.right = 'auto';
        element.style.transform = 'none';
        console.log('[Jira Bulk] 📍 Position restored:', { left, top });
      } catch (e) {
        console.warn('[Jira Bulk] Failed to restore position:', e);
      }
    }
  }

  // Toggle UI visibility
  function toggleBulkUI() {
    const content = document.getElementById('bulk-content');
    const toggleBtn = document.getElementById('bulk-toggle-btn');
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      toggleBtn.textContent = 'Hide';
    } else {
      content.style.display = 'none';
      toggleBtn.textContent = 'Show';
    }
  }

  // Start processing
  function startProcessing() {
    const textarea = document.getElementById('bulk-email-input');
    const emailList = textarea.value;
    processEmailList(emailList);
  }

  // Clear input
  function clearInput() {
    const textarea = document.getElementById('bulk-email-input');
    textarea.value = '';
    updateStatus('Ready to process emails', 'info');
  }

  // Check if Jira user search field is present
  function hasJiraUserSearchField() {
    // Primary selector - exact match for Jira's user search
    const primaryInput = document.querySelector('input[placeholder="Search by name or email"]');
    if (primaryInput) {
      console.log('[Jira Bulk] Found exact match: "Search by name or email"');
      return true;
    }
    
    // Fallback selectors
    const fallbackSelectors = [
      'input[placeholder*="Search by name"]',
      'input[placeholder*="name or email"]',
      'input[aria-autocomplete="list"]',
      'input[id^="react-select"]'
    ];
    
    for (const selector of fallbackSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        console.log('[Jira Bulk] Found fallback match:', selector);
        return true;
      }
    }
    
    return false;
  }

  // Toggle UI visibility
  function toggleUI() {
    const container = document.getElementById('bulk-user-container');
    const floatingBtn = document.getElementById('bulk-floating-btn');
    
    if (container) {
      // If exists, toggle display
      if (container.style.display === 'none') {
        container.style.display = 'block';
        if (floatingBtn) floatingBtn.style.display = 'none';
        console.log('[Jira Bulk] UI shown');
      } else {
        container.style.display = 'none';
        if (floatingBtn) floatingBtn.style.display = 'flex';
        console.log('[Jira Bulk] UI hidden');
      }
    } else {
      // Create new UI
      console.log('[Jira Bulk] Creating UI');
      createBulkUI();
      if (floatingBtn) floatingBtn.style.display = 'none';
    }
  }

  // Show UI
  function showUI() {
    let container = document.getElementById('bulk-user-container');
    const floatingBtn = document.getElementById('bulk-floating-btn');
    
    if (!container) {
      console.log('[Jira Bulk] Creating UI (auto-detected)');
      container = createBulkUI();
      if (floatingBtn) floatingBtn.style.display = 'none';
    }
    
    // Restore position if saved
    if (container) {
      restorePosition(container);
    }
  }

  // Observe DOM for Jira user search dialog appearance
  function observeForDialogs() {
    let debounceTimer = null;
    let lastCheck = 0;
    
    const observer = new MutationObserver((mutations) => {
      // Debounce to avoid too many checks
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Don't check too frequently
      const now = Date.now();
      if (now - lastCheck < 300) {
        return;
      }
      
      debounceTimer = setTimeout(() => {
        lastCheck = Date.now();
        
        // Check if Jira user search field appeared
        if (hasJiraUserSearchField()) {
          const container = document.getElementById('bulk-user-container');
          if (!container) {
            console.log('[Jira Bulk] Detected "Search by name or email" field, showing UI');
            showUI();
          }
        }
      }, 200);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('[Jira Bulk] Observer started - watching for "Search by name or email"');
  }

  // Initialize
  function init() {
    console.log('[Jira Bulk] 🚀 Extension v1.7.2 - Enhanced Cloud Jira support initialized');
    console.log('[Jira Bulk] 🌐 URL:', window.location.href);

    // Listen for messages from background script (toolbar button click)
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleUI') {
        console.log('[Jira Bulk] 🔄 Toggle UI requested');
        toggleUI();
        sendResponse({ success: true });
      }
      return true; // Keep channel open for async response
    });

    // Function to initialize UI
    const initializeUI = () => {
      console.log('[Jira Bulk] 🎯 Initializing UI...');
      
      // Always create floating button
      createFloatingButton();
      
      // Check if Jira user search field is already present
      if (hasJiraUserSearchField()) {
        console.log('[Jira Bulk] ✅ Found "Search by name or email" - auto-showing UI');
        showUI();
      } else {
        console.log('[Jira Bulk] ⏳ Waiting for "Search by name or email" field...');
      }
      
      // Start observing for dialogs
      observeForDialogs();
    };

    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[Jira Bulk] 📄 DOM loaded');
        setTimeout(initializeUI, 1000);
      });
    } else {
      console.log('[Jira Bulk] 📄 DOM already loaded');
      setTimeout(initializeUI, 1000);
    }
  }

  // Start the extension
  init();
})();

