---
name: rules-of-react
description: Enforce React's official rules and best practices for writing correct, optimizable code. Use when: (1) Writing or reviewing React components/hooks, (2) Debugging unexpected re-renders or state issues, (3) Checking hook usage patterns, (4) Ensuring component purity, (5) Managing state correctly, (6) Using Effects properly, (7) Code review for React best practices.
---

# Rules of React

## Quick Reference

| Rule          | Do                                     | Don't                                         |
| ------------- | -------------------------------------- | --------------------------------------------- |
| Purity        | Return same output for same inputs     | Use `new Date()` or `Math.random()` in render |
| Side effects  | Use Effects or event handlers          | Modify DOM during render                      |
| Mutations     | Create copies, use setters             | Mutate props, state, or hook returns          |
| Components    | Use in JSX: `<Article />`              | Call directly: `Article()`                    |
| Hooks         | Call at top level                      | Call in loops, conditions, or callbacks       |
| Keys          | Use stable IDs from data               | Use array index or random keys                |
| State updates | Use updater `s => s + 1` for sequences | Multiple `setState(value)` calls              |
| Derived state | Calculate during render                | Store in useState                             |
| Effects       | Sync with external systems             | Transform data or handle events               |

## Rule 1: Components and Hooks Must Be Pure

### Idempotency

Components must return the same output for the same inputs.

```tsx
// Bad: Changes every render
function Clock() {
  const time = new Date();
  return <span>{time.toLocaleString()}</span>;
}

// Good: Use Effect for side effects
function Clock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return <span>{time.toLocaleString()}</span>;
}
```

### No Side Effects in Render

Side effects belong in Effects or event handlers, not during render.

```tsx
// Bad: Side effect during render
function ProductPage({ product }) {
  document.title = product.title;
  return <h1>{product.title}</h1>;
}

// Good: Side effect in Effect
function ProductPage({ product }) {
  useEffect(() => {
    document.title = product.title;
  }, [product.title]);

  return <h1>{product.title}</h1>;
}
```

### No Mutation of Non-Local Values

Only mutate values created within the same render.

```tsx
// Bad: Mutating external array
const items = [];
function FriendList({ friends }) {
  friends.forEach(f => items.push(<Friend key={f.id} friend={f} />));
  return <section>{items}</section>;
}

// Good: Create local array
function FriendList({ friends }) {
  const items = [];
  friends.forEach(f => items.push(<Friend key={f.id} friend={f} />));
  return <section>{items}</section>;
}
```

### Props and State Are Immutable

Never mutate props or state directly.

```tsx
// Bad: Mutating props
function Post({ item }) {
  item.url = new URL(item.url, base);
  return <Link url={item.url}>{item.title}</Link>;
}

// Good: Create new value
function Post({ item }) {
  const url = new URL(item.url, base);
  return <Link url={url}>{item.title}</Link>;
}

// Bad: Mutating state directly
function Counter() {
  const [count, setCount] = useState(0);
  const handleClick = () => { count = count + 1; };
}

// Good: Use setter
function Counter() {
  const [count, setCount] = useState(0);
  const handleClick = () => setCount(count + 1);
}
```

### Hook Arguments/Returns Are Immutable

Never mutate values passed to or returned from hooks.

```tsx
// Bad: Mutating hook argument
function useIconStyle(icon) {
  const theme = useContext(ThemeContext);
  if (icon.enabled) {
    icon.className = computeStyle(icon, theme);
  }
  return icon;
}

// Good: Return new object
function useIconStyle(icon) {
  const theme = useContext(ThemeContext);
  if (!icon.enabled) return icon;
  return { ...icon, className: computeStyle(icon, theme) };
}
```

### Values Immutable After JSX Creation

Don't mutate values after using them in JSX.

```tsx
// Bad: Mutating after JSX
function Page({ color }) {
  const styles = { color, size: "large" };
  const header = <Header styles={styles} />;
  styles.size = "small"; // Already used in JSX!
  const footer = <Footer styles={styles} />;
  return <>{header}<Content />{footer}</>;
}

// Good: Create separate values
function Page({ color }) {
  const headerStyles = { color, size: "large" };
  const footerStyles = { color, size: "small" };
  return (
    <>
      <Header styles={headerStyles} />
      <Content />
      <Footer styles={footerStyles} />
    </>
  );
}
```

## Rule 2: React Calls Components and Hooks

### Never Call Components Directly

Let React control component rendering via JSX.

```tsx
// Bad: Calling component as function
function BlogPost() {
  return <Layout>{Article()}</Layout>;
}

// Good: Use JSX syntax
function BlogPost() {
  return <Layout><Article /></Layout>;
}
```

**Why**: Direct calls break React's ability to optimize rendering, manage state, and maintain component identity.

### Never Pass Hooks as Values

Hooks must be called directly, not passed around.

```tsx
// Bad: Higher-order hook
function ChatInput() {
  const useDataWithLogging = withLogging(useData);
  const data = useDataWithLogging();
}

// Good: Create static hook
function ChatInput() {
  const data = useDataWithLogging();
}

function useDataWithLogging() {
  const data = useData();
  // Add logging inline
  return data;
}

// Bad: Hook as prop
function ChatInput() {
  return <Button useData={useDataWithLogging} />;
}

// Good: Call hook in component
function Button() {
  const data = useDataWithLogging();
  return <button>{data}</button>;
}
```

## Rule 3: Rules of Hooks

### Only Call Hooks at Top Level

Never call hooks inside loops, conditions, nested functions, or try/catch.

```tsx
// Bad: Conditional hook
function Bad({ cond }) {
  if (cond) {
    const theme = useContext(ThemeContext);
  }
}

// Bad: Hook in loop
function Bad() {
  for (let i = 0; i < 10; i++) {
    const [state] = useState(i);
  }
}

// Bad: After conditional return
function Bad({ cond }) {
  if (cond) return null;
  const theme = useContext(ThemeContext);
}

// Bad: In event handler
function Bad() {
  const handleClick = () => {
    const theme = useContext(ThemeContext);
  };
}

// Bad: Inside useMemo/useEffect callback
function Bad() {
  const style = useMemo(() => {
    const theme = useContext(ThemeContext);
    return createStyle(theme);
  });
}

// Bad: In try/catch
function Bad() {
  try {
    const [x, setX] = useState(0);
  } catch {
    const [x, setX] = useState(1);
  }
}

// Good: Top level
function Good({ cond }) {
  const theme = useContext(ThemeContext);
  const [state, setState] = useState(0);

  if (cond) return null;
  return <div style={{ color: theme.primary }}>{state}</div>;
}
```

**Why**: React relies on hook call order to maintain state correctly.

### Only Call Hooks from React Functions

Hooks can only be called from:

- Function components
- Custom hooks (functions starting with `use`)

```tsx
// Good: In function component
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Good: In custom hook
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return width;
}

// Bad: In regular function
function getOnlineStatus() {
  const [status] = useState('online'); // Not a component or hook!
  return status;
}
```

## Tooling

Use `eslint-plugin-react-hooks` to automatically enforce these rules:

```bash
npm install eslint-plugin-react-hooks --save-dev
```

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Best Practice 4: Keys in Lists

Use stable, unique identifiers for list keys.

```tsx
// Bad: Using array index
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// Bad: Generating random keys
{items.map(item => (
  <Item key={Math.random()} data={item} />
))}

// Good: Using stable ID from data
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

**Why**: React uses keys to track which items changed, were added, or removed. Index keys cause bugs when list order changes. Random keys recreate components on every render.

## Best Practice 5: State as Snapshot

State is a snapshot captured at render time. Setting state queues a re-render with the new value.

```tsx
// Bad: Expecting synchronous updates
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  // Result: count increases by 1, not 3!
  // All three calls read the same snapshot
}

// Good: Use updater function for sequential updates
function handleClick() {
  setCount(c => c + 1);
  setCount(c => c + 1);
  setCount(c => c + 1);
  // Result: count increases by 3
}
```

**Why**: Each updater receives the previous state as argument, chaining updates correctly.

## Best Practice 6: Avoid Redundant State

Don't store values that can be calculated from existing state or props.

```tsx
// Bad: Redundant fullName state
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');

  function handleFirstNameChange(e) {
    setFirstName(e.target.value);
    setFullName(e.target.value + ' ' + lastName); // Easy to forget!
  }
}

// Good: Calculate during render
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const fullName = firstName + ' ' + lastName; // Always in sync

  function handleFirstNameChange(e) {
    setFirstName(e.target.value);
  }
}
```

## Best Practice 7: When NOT to Use Effects

Effects are for synchronizing with external systems, not for transforming data or handling events.

```tsx
// Bad: Using Effect for derived data
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
}

// Good: Calculate during render
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const fullName = firstName + ' ' + lastName;
}

// Bad: Using Effect for event handling
useEffect(() => {
  if (submitted) {
    sendAnalytics();
  }
}, [submitted]);

// Good: Handle in event handler
function handleSubmit() {
  setSubmitted(true);
  sendAnalytics();
}
```

## Best Practice 8: Effect Dependencies

Include all reactive values used in the Effect. Move objects/functions inside to avoid unnecessary re-runs.

```tsx
// Bad: Object dependency causes infinite loop
function ChatRoom({ roomId }) {
  const options = { serverUrl, roomId }; // Recreated every render

  useEffect(() => {
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [options]); // Reconnects on every render!
}

// Good: Move object inside Effect
function ChatRoom({ roomId }) {
  useEffect(() => {
    const options = { serverUrl, roomId };
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // Only reconnects when roomId changes
}
```

**Rule**: If an Effect uses a value, that value must be in the dependency array. To remove a dependency, change your code so the Effect doesn't need it.
