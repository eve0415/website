---
name: react-compiler
description: |
  React Compiler best practices and Rules of React for writing compiler-compatible code.
  Use when: (1) Writing React components, (2) Discussing React performance optimization,
  (3) Asking about React Compiler compatibility, (4) Debugging memoization issues,
  (5) Reviewing React code for best practices. Covers Do's and Don'ts with code examples.
---

# React Compiler Best Practices

React Compiler automatically handles memoization (replacing manual `useMemo`, `useCallback`, `React.memo`). It relies on code following the **Rules of React**.

## Rules of React

### 1. Components Must Be Pure

Same inputs must produce same output.

```tsx
// ✅ DO
const Greeting = ({ name }: Props) => <h1>Hello, {name}</h1>;

// ❌ DON'T: Non-deterministic output
const Greeting = ({ name }: Props) => (
  <h1>
    Hello, {name} at {Date.now()}
  </h1>
);
```

### 2. Side Effects Outside Render

Never run side effects during render.

```tsx
// ✅ DO
const Component = () => {
  useEffect(() => {
    fetch('/api/data');
  }, []);
  return <div>...</div>;
};

// ❌ DON'T
const Component = () => {
  fetch('/api/data'); // Runs every render!
  return <div>...</div>;
};
```

### 3. Props and State Are Immutable

Never mutate props or state directly.

```tsx
// ✅ DO
setState({ ...state, field: newValue });
setState([...array, newItem]);

// ❌ DON'T
state.field = newValue;
props.array.push(item);
```

### 4. Hooks at Top Level Only

Never call hooks conditionally or in loops.

```tsx
// ✅ DO
const Component = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  if (count > 0) return <div>{name}</div>;
  return null;
};

// ❌ DON'T
const Component = ({ condition }) => {
  if (condition) {
    const [state] = useState(0); // Breaks hook order
  }
};
```

### 5. Hooks Only in React Functions

Only call hooks from components or custom hooks.

```tsx
// ✅ DO
const useCustomHook = () => {
  const [state] = useState(0);
  return state;
};

// ❌ DON'T
const helper = () => {
  const [state] = useState(0); // Not a React function
};
```

### 6. Never Call Components as Functions

Always use JSX syntax.

```tsx
// ✅ DO
<MyComponent prop={value} />;

// ❌ DON'T
MyComponent({ prop: value });
```

### 7. Don't Mutate After JSX Creation

Values become immutable after being used in JSX.

```tsx
// ✅ DO
const obj = { field: value };
return <Component obj={obj} />;

// ❌ DON'T
const jsx = <Component obj={obj} />;
obj.field = newValue; // Too late!
```

## Best Practices

- Use `eslint-plugin-react-hooks` to catch violations
- Enable React Strict Mode during development
- Don't rely on memoization for correctness (effects should work without it)
- Remove manual `useMemo`/`useCallback` when using React Compiler

## Debugging

If something breaks with React Compiler:

1. Add `"use no memo"` directive to isolate the issue:
   ```tsx
   function ProblematicComponent() {
     'use no memo';
     // Component code
   }
   ```
2. If issue disappears → likely a Rules of React violation
3. Remove manual memoization and test again
4. Check ESLint for violations before reporting compiler bugs

Most runtime issues are **Rules of React violations**, not compiler bugs.
