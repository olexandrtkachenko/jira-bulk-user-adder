# 📧 Jira Bulk User Adder

> Automatically add multiple users to Jira project roles by email list

Chrome extension that automates the process of adding multiple users to Jira projects, saving you hours of manual work.

---

## ✨ Features

- ✅ **Bulk Processing** - Add multiple users at once
- ✅ **Smart Waiting** - Automatically waits for Jira autocomplete to load
- ✅ **Statistics** - See how many users added, failed, and processing time
- ✅ **Universal** - Works with any Jira instance (Cloud, Server, Data Center)
- ✅ **Draggable UI** - Position the popup wherever you want
- ✅ **No API Required** - Works through DOM manipulation
- ✅ **On-Demand** - Activates only when you click the icon

---

## 🌐 Browser Support

<div align="center">

| Browser | Supported | Version |
|---------|-----------|---------|
| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" width="24"/> **Chrome** | ✅ Yes | 88+ |
| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" width="24"/> **Edge** | ✅ Yes | 88+ |
| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/brave/brave_48x48.png" width="24"/> **Brave** | ✅ Yes | All versions |
| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" width="24"/> **Opera** | ✅ Yes | 74+ |
| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/vivaldi/vivaldi_48x48.png" width="24"/> **Vivaldi** | ✅ Yes | All versions |
| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" width="24"/> **Firefox** | ❌ No | Not compatible* |
| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" width="24"/> **Safari** | ❌ No | Not compatible* |

</div>

> **Note:** This extension uses Chrome Extension Manifest V3, which is compatible with all Chromium-based browsers.
> 
> *Firefox and Safari use different extension APIs and would require separate versions.

### Recommended Browsers

**Best Experience:**
- ✅ **Google Chrome** - Primary development platform
- ✅ **Microsoft Edge** - Full compatibility
- ✅ **Brave** - Enhanced privacy features

**Also Works:**
- ✅ **Opera** - All features supported
- ✅ **Vivaldi** - All features supported
- ✅ Any Chromium-based browser

---

## 🚀 Installation

### Method 1: Load Unpacked (Developer Mode)

1. Download this repository:
   - Click "Code" → "Download ZIP"
   - Or clone: `git clone https://github.com/YOUR_USERNAME/jira-bulk-user-adder.git`

2. Unzip the downloaded file

3. Open Chrome and go to: `chrome://extensions/`

4. Enable **"Developer mode"** (toggle in top right)

5. Click **"Load unpacked"**

6. Select the folder containing the extension files

7. Done! ✅ You should see the extension icon in your toolbar

### Method 2: Chrome Web Store

Coming soon!

---

## 📖 How to Use

1. **Open Any Jira Page**
   - Navigate to your Jira instance
   - Example: `https://your-company.atlassian.net/`

2. **Click the Extension Icon**
   - Click the 📧 icon in your Chrome toolbar
   - Plugin will inject and show the interface

3. **Go to Project Roles**
   - Project Settings → People → Roles
   - Click "Add users" for any role

4. **Enter Email Addresses**
   - Paste your email list (one per line)
   - Example:
     ```
     john.doe@example.com
     jane.smith@example.com
     bob.johnson@example.com
     ```

5. **Start Processing**
   - Click "▶️ Start Processing"
   - Watch the magic happen! ✨

6. **View Statistics**
   - See summary at the end:
     - Successfully added
     - Failed emails (if any)
     - Total time
     - Average time per user

---

## 📊 Example

**Input:**
```
alice@company.com
bob@company.com
charlie@company.com
```

**Processing:**
```
📧 Processing 1 of 3: alice@company.com
✅ User successfully added: alice@company.com

📧 Processing 2 of 3: bob@company.com
✅ User successfully added: bob@company.com

📧 Processing 3 of 3: charlie@company.com
✅ User successfully added: charlie@company.com
```

**Result:**
```
📊 Summary

✅ Successfully added: 3 of 3
⏱️ Total time: 12.3 seconds
⚡ Average time per user: 4.1 seconds
```

---

## ⚙️ Settings

Configure processing speed:

- **Max wait for users** - How long to wait for autocomplete (default: 15 sec)
- **Delay after select** - Pause after selecting user (default: 500ms)
- **Delay between users** - Pause between processing users (default: 400ms)

*Adjust these if your Jira is slow or fast!*

---

## 💼 Supported Jira Versions

<div align="center">

| Jira Type | Supported | Versions | Notes |
|-----------|-----------|----------|-------|
| **Jira Cloud** | ✅ Yes | All | Atlassian-hosted (*.atlassian.net) |
| **Jira Server** | ✅ Yes | 8.0+ | Self-hosted |
| **Jira Data Center** | ✅ Yes | 8.0+ | Enterprise self-hosted |

</div>

**Tested on:**
- ✅ Jira Cloud (latest)
- ✅ Jira Data Center v10.3.12
- ✅ Jira Server v9.12
- ✅ Jira Server v8.22

**Universal Selectors:** The extension uses multiple selector strategies to work across different Jira versions and UI variations.

---

## 🎯 Features in Detail

### Smart Autocomplete Waiting

The plugin doesn't use fixed delays - it intelligently waits for:
1. Autocomplete dropdown to appear
2. User list to load
3. First user to be selectable

This adapts to your Jira's performance!

### Draggable Interface

- Click and drag the blue header to reposition
- Position is saved automatically
- Resets to center-right on first use

### Processing Statistics

After processing, you'll see:
- ✅ **Success count** - How many users were added
- ❌ **Failed list** - Emails that couldn't be added (with reasons)
- ⏱️ **Time stats** - Total and average processing time

### On-Demand Activation

- Plugin sleeps by default (saves memory)
- Activates only when you click the icon
- No background processes running

---

## 🔒 Privacy & Security

- ✅ **No data collection** - We don't collect ANY data
- ✅ **No external servers** - Everything runs locally in your browser
- ✅ **No API calls** - Works through DOM manipulation only
- ✅ **Open source** - You can review the code
- ✅ **Local storage only** - Only saves UI position preference

**Permissions used:**
- `activeTab` - To interact with the current Jira page
- `scripting` - To inject the UI into the page
- `notifications` - To show activation errors (optional)

---

## 🐛 Troubleshooting

### Plugin doesn't activate
- Make sure you clicked the extension icon
- Check browser console (F12) for errors
- Verify you're on a web page (not chrome:// page)

### Email input is blocked
- Try clicking the extension icon again
- Drag the popup to a different position
- Check if Jira popup is blocking it

### Processing is too slow/fast
- Adjust settings (⚙️ icon in plugin)
- Increase "Max wait" if Jira is slow
- Decrease delays if Jira is fast

### User not found
- Check email spelling
- Ensure user exists in your Jira
- User might not have access rights

---

## 🛠️ Development

### Project Structure

```
/
├── manifest.json       # Extension configuration
├── content.js          # Main logic
├── background.js       # Service worker (on-demand injection)
├── styles.css          # UI styles
├── icon16.png          # Toolbar icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Store icon (128x128)
└── README.md           # This file
```

### Building

No build process needed! Just load the extension directly.

### Version History

- **v1.6.1** - Public release, on-demand activation
- **v1.6.0** - Draggable UI, centered positioning
- **v1.5.0** - Processing statistics
- **v1.4.0** - Fast processing (40% faster)
- **v1.3.1** - Smart autocomplete waiting
- **v1.0.0** - Initial release

---

## 📝 Changelog

See version history above for major changes.

---

## 👨‍💻 Author

**Oleksandr Tkachenko**
- Email: [Oleksandr_Tkachenko@outlook.com](mailto:Oleksandr_Tkachenko@outlook.com)

---

## 📄 License

MIT License - feel free to use and modify!

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 🙏 Acknowledgments

Built with:
- Chrome Extension API
- JavaScript (ES6+)
- Pure CSS (no frameworks)

---

## ⭐ Support

If this extension saved you time:
- ⭐ Star this repository
- 🐛 Report bugs in Issues
- 💡 Suggest features
- 📢 Share with colleagues

---

**Made with ❤️ for Jira users everywhere**

