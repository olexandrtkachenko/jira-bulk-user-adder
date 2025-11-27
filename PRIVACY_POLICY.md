# Privacy Policy for Jira Bulk User Adder & Jira Automation Toolkit

**Last Updated:** November 27, 2025

## Overview

Jira Bulk User Adder ("the Extension") is committed to protecting your privacy. This privacy policy explains our practices regarding data collection, usage, and protection.

## Data Collection

**The Extension does NOT collect, store, transmit, or process any personal data.**

### What We Don't Collect:
- ❌ Personal information
- ❌ Email addresses entered into the extension
- ❌ Jira credentials or authentication data
- ❌ Usage statistics or analytics
- ❌ IP addresses
- ❌ Browser history
- ❌ Any other user data

## What the Extension Does

The Extension only:

1. **Reads the current page DOM** - To identify Jira interface elements and interact with them
2. **Stores UI preferences locally** - Your chosen popup position is saved in your browser's local storage and never leaves your device
3. **Operates entirely locally** - All processing happens in your browser

## Data Storage

### Local Storage Only:
- **What's stored:** UI window position (x, y coordinates)
- **Where:** Browser's local storage (localStorage API)
- **Duration:** Until you clear browser data or uninstall the extension
- **Access:** Only you, only on your device

### No External Storage:
- ❌ No cloud storage
- ❌ No remote servers
- ❌ No databases
- ❌ No third-party services

## Network Activity

**The Extension makes NO network requests.**

- ❌ No data sent to external servers
- ❌ No analytics or tracking
- ❌ No ads or marketing
- ❌ No third-party integrations

## Permissions

The Extension requests the following permissions:

### activeTab
**Purpose:** To interact with the current Jira page
**Usage:** Reading page content and injecting the extension's UI
**Data Access:** Only the active Jira tab, only when you click the extension icon

### scripting
**Purpose:** To inject JavaScript and CSS into the Jira page
**Usage:** Creating the extension's interface and automation functionality
**Data Access:** No data is collected; only UI injection

### notifications
**Purpose:** To show error messages
**Usage:** Displaying user-friendly error messages if activation fails
**Data Access:** No data is collected; notifications are shown locally

### host_permissions (all_urls)
**Purpose:** To work with any Jira instance
**Usage:** Jira can be self-hosted on any domain
**Data Access:** Extension only activates when you click its icon; no background monitoring

## Open Source

The Extension is open source. You can:
- Review the complete source code
- Verify that no data collection occurs
- Audit the code yourself
- Contribute improvements

**Repository:** [GitHub URL will be added after publishing]

## Third-Party Services

**We use ZERO third-party services.**

- ❌ No Google Analytics
- ❌ No error tracking services
- ❌ No advertising networks
- ❌ No CDNs for code or assets

Everything is bundled with the extension.

## Children's Privacy

The Extension does not knowingly collect any information from anyone, including children under 13.

## Changes to This Policy

If we ever change our privacy practices (which we don't plan to), we will:
1. Update this policy
2. Update the "Last Updated" date
3. Notify users through the extension update notes

## Data Protection Rights

Since we don't collect any data, there is no data to:
- Access
- Rectify  
- Erase
- Restrict processing
- Port to another service
- Object to processing

Your data stays with you, on your device, always.

## Contact

If you have questions about this privacy policy:

**Email:** Oleksandr_Tkachenko@outlook.com

**Response Time:** We aim to respond within 48 hours

## Transparency

### What Happens When You Use the Extension:

1. You click the extension icon
2. Extension reads the current Jira page's HTML
3. Extension creates a popup interface on the page
4. You enter email addresses (stays in your browser)
5. Extension simulates user interactions with Jira (typing, clicking)
6. Email addresses are sent to Jira (not to us)
7. When you close the extension, data is cleared (except UI position preference)

### No Server Communication:

```
Your Browser → [Extension] → Jira Page
             ↓
      [Local Storage]
      (UI position only)
             
❌ No connection to external servers
❌ No data sent anywhere else
```

## Compliance

This Extension complies with:
- ✅ GDPR (EU General Data Protection Regulation)
- ✅ CCPA (California Consumer Privacy Act)
- ✅ Chrome Web Store Developer Program Policies
- ✅ Google API Services User Data Policy

## Summary

**In Plain English:**

- We don't collect your data
- We don't send your data anywhere
- We don't store your data on our servers (we don't have servers!)
- Everything happens in your browser
- Your privacy is 100% protected

**That's it. Simple and transparent.** ✅

---

**Jira Bulk User Adder**
Version 1.7.2
**Jira Automation Toolkit**
Version 3.0.0
November 27, 2025

