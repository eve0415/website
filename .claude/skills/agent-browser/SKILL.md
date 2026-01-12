# agent-browser

Browser automation CLI optimized for AI agents. Use `pnpx agent-browser` for all commands.

## When to Use

- Testing websites and web applications
- Verifying UI changes after code modifications
- Checking for console errors and page issues
- Taking screenshots for documentation or debugging
- Automating form submissions and user flows

## Core Workflow

**Always follow this pattern: snapshot → identify refs → act → snapshot again**

```bash
pnpx agent-browser open http://localhost:4321    # Navigate
pnpx agent-browser snapshot -i                    # Get interactive elements with refs
pnpx agent-browser click @e2                      # Act using ref from snapshot
pnpx agent-browser snapshot -i                    # Get updated state
```

Refs (e.g., `@e1`, `@e2`) are stable element identifiers from snapshots. Always use refs over CSS selectors when possible.

**Important:** Always use `snapshot -i` (interactive elements only) by default. This dramatically reduces output size by filtering to just buttons, links, inputs, and other actionable elements - which is usually all you need for browser automation. Only use full `snapshot` when you need to verify text content or page structure.

## Essential Commands

### Navigation
```bash
pnpx agent-browser open <url>        # Navigate to URL
pnpx agent-browser back              # Go back
pnpx agent-browser reload            # Reload page
pnpx agent-browser close             # Close browser
```

### Page Analysis
```bash
pnpx agent-browser snapshot -i       # Interactive elements only (preferred default)
pnpx agent-browser snapshot          # Full accessibility tree (when you need all content)
pnpx agent-browser snapshot -i -c    # Interactive + compact (minimal output)
pnpx agent-browser errors            # Check for JS errors
pnpx agent-browser console           # View console logs
```

### Interaction
```bash
pnpx agent-browser click @e1         # Click element
pnpx agent-browser fill @e2 "text"   # Clear field and type
pnpx agent-browser type @e2 "text"   # Type without clearing
pnpx agent-browser press Enter       # Press key
pnpx agent-browser hover @e3         # Hover element
pnpx agent-browser scroll down 500   # Scroll page
```

### Capture
```bash
pnpx agent-browser screenshot                    # Screenshot viewport
pnpx agent-browser screenshot --full             # Full page screenshot
pnpx agent-browser screenshot /path/to/file.png  # Save to specific path
pnpx agent-browser pdf /path/to/file.pdf         # Save as PDF
```

### Get Information
```bash
pnpx agent-browser get text @e1      # Get element text
pnpx agent-browser get url           # Get current URL
pnpx agent-browser get title         # Get page title
pnpx agent-browser get value @e2     # Get input value
```

## Common Testing Workflows

### Test a Local Dev Server
```bash
# Start dev server first (in background), then:
pnpx agent-browser open http://localhost:4321
pnpx agent-browser snapshot -i       # Get interactive elements
pnpx agent-browser errors            # Check for JS errors
pnpx agent-browser screenshot /tmp/homepage.png
```

### Test Navigation Flow
```bash
pnpx agent-browser open http://localhost:4321
pnpx agent-browser snapshot -i       # Find navigation links
pnpx agent-browser click @e5         # Click a nav link
pnpx agent-browser snapshot -i       # Verify new page loaded
```

### Test Dark Mode
```bash
pnpx agent-browser snapshot -i       # Find theme toggle
pnpx agent-browser click @e1         # Toggle theme
pnpx agent-browser screenshot /tmp/dark-mode.png
```

### Test Form Submission
```bash
pnpx agent-browser snapshot -i       # Get interactive elements
pnpx agent-browser fill @e3 "test@example.com"
pnpx agent-browser fill @e4 "message"
pnpx agent-browser click @e5         # Submit button
pnpx agent-browser snapshot -i       # Check result
```

## Snapshot Output Format

```
- document:
  - button "Toggle theme" [ref=e1]
  - main:
    - heading "Title" [ref=e2] [level=1]
    - link "About" [ref=e3]:
      - /url: /about
    - textbox "Email" [ref=e4]
```

- Elements have `[ref=eN]` for targeting
- Links show `/url:` with their href
- Headings show `[level=N]`
- Form elements show their type (textbox, checkbox, etc.)

## Snapshot Options

| Flag | Purpose |
|------|---------|
| `-i` | **Interactive elements only (recommended default)** - dramatically reduces context |
| `-c` | Compact (remove empty structural elements) |
| `-d 3` | Limit tree depth |
| `-s "#main"` | Scope to CSS selector |

Combine flags for minimal output: `pnpx agent-browser snapshot -i -c`

## Alternative Selectors

When refs aren't available, use:
```bash
pnpx agent-browser click "#submit"           # CSS selector
pnpx agent-browser click "text=Sign In"      # Text content
pnpx agent-browser find role button click --name "Submit"  # ARIA role
```

## Sessions (Multiple Browsers)

Run isolated browser instances:
```bash
pnpx agent-browser --session test1 open site-a.com
pnpx agent-browser --session test2 open site-b.com
```

## Troubleshooting

**Browser not installed:**
```bash
pnpx agent-browser install
```

**Element not found:** Run `snapshot` again - refs change when page updates.

**Page still loading:** Add wait:
```bash
pnpx agent-browser wait 2000                 # Wait 2 seconds
pnpx agent-browser wait --load networkidle   # Wait for network idle
```
