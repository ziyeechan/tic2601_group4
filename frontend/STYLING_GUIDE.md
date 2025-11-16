# MakanTime Frontend - Quick Styling Guide

## For Non-Tailwind Users

This frontend uses **plain CSS with utility classes** - no Tailwind required! All styles are in `src/styles.css`.

## Quick Reference

### Cards
```jsx
<div className="card">
  <div className="card-header">
    <h4 className="card-title">Title Here</h4>
  </div>
  <div className="card-content">
    <p>Content goes here</p>
  </div>
  <div className="card-footer">
    Footer actions
  </div>
</div>
```

### Buttons
```jsx
// Primary button
<button className="btn btn-primary">Click Me</button>

// Secondary button
<button className="btn btn-secondary">Click Me</button>

// Danger button
<button className="btn btn-danger">Delete</button>

// Success button
<button className="btn btn-success">Confirm</button>

// Small button
<button className="btn btn-sm">Small</button>

// Large button
<button className="btn btn-lg">Large</button>

// Full width
<button className="btn btn-primary btn-full">Full Width</button>
```

### Forms
```jsx
<div className="form-group">
  <label>Field Label</label>
  <input type="text" placeholder="Enter text" />
</div>

// Two-column form
<div className="form-row">
  <div className="form-group">
    <label>First Name</label>
    <input type="text" />
  </div>
  <div className="form-group">
    <label>Last Name</label>
    <input type="text" />
  </div>
</div>

// Textarea
<textarea placeholder="Enter message"></textarea>

// Select dropdown
<select>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Badges
```jsx
// Primary badge
<span className="badge badge-primary">New</span>

// Success badge
<span className="badge badge-success">Active</span>

// Danger badge
<span className="badge badge-danger">Urgent</span>

// Warning badge
<span className="badge badge-warning">Pending</span>

// Outline badge
<span className="badge badge-outline">Inactive</span>
```

### Status Badges (for bookings)
```jsx
<span className="badge status-confirmed">Confirmed</span>
<span className="badge status-pending">Pending</span>
<span className="badge status-completed">Completed</span>
<span className="badge status-cancelled">Cancelled</span>
<span className="badge status-no_show">No Show</span>
<span className="badge status-seated">Seated</span>
```

### Alerts
```jsx
<div className="alert alert-success">
  ✓ Success message
</div>

<div className="alert alert-danger">
  ✕ Error message
</div>

<div className="alert alert-warning">
  ⚠ Warning message
</div>

<div className="alert alert-info">
  ℹ Information message
</div>
```

### Grids & Layouts
```jsx
// 3-column grid
<div className="grid grid-3">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

// 4-column grid
<div className="grid grid-4">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
  <div>Col 4</div>
</div>

// Flexible layout with CSS (inline style)
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 'var(--spacing-md)'
}}>
  <div>Left</div>
  <div>Right</div>
</div>
```

### Flexbox
```jsx
// Flex with gap
<div className="flex gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Space between
<div className="flex-between">
  <div>Left</div>
  <div>Right</div>
</div>

// Centered
<div className="flex-center">
  <div>Centered</div>
</div>

// Column layout
<div className="flex flex-col gap-md">
  <div>Top</div>
  <div>Bottom</div>
</div>
```

### Spacing Utilities
```jsx
// Padding
<div className="p-md">Padding all sides</div>
<div className="px-md">Padding left & right</div>
<div className="py-md">Padding top & bottom</div>

// Margin
<div className="m-md">Margin all sides</div>
<div className="mb-md">Margin bottom</div>
<div className="mt-lg">Margin top large</div>
<div className="gap-md">Gap between items (flex)</div>
```

### Text Utilities
```jsx
<p className="text-sm">Small text</p>
<p className="text-md">Medium text (default)</p>
<p className="text-lg">Large text</p>
<p className="text-muted">Gray secondary text</p>
<p className="text-center">Centered text</p>
<strong className="font-bold">Bold text</strong>
<span className="font-semibold">Semibold text</span>
```

### Images
```jsx
// Image container with aspect ratio
<div className="aspect-video image-container">
  <img src="image.jpg" alt="Description" />
</div>

// Square aspect ratio
<div className="aspect-square image-container">
  <img src="image.jpg" alt="Description" />
</div>
```

### Tables
```jsx
<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

### Tabs
```jsx
<div className="tabs">
  <button
    className={`tab-button ${activeTab === 'tab1' ? 'active' : ''}`}
    onClick={() => setActiveTab('tab1')}
  >
    Tab 1
  </button>
  <button
    className={`tab-button ${activeTab === 'tab2' ? 'active' : ''}`}
    onClick={() => setActiveTab('tab2')}
  >
    Tab 2
  </button>
</div>

<div className={`tab-content ${activeTab === 'tab1' ? 'active' : ''}`}>
  Tab 1 content
</div>
<div className={`tab-content ${activeTab === 'tab2' ? 'active' : ''}`}>
  Tab 2 content
</div>
```

### Empty State
```jsx
<div className="empty-state">
  <h3>No results found</h3>
  <p>Try adjusting your filters.</p>
</div>
```

## CSS Variables (Use in inline styles)

```javascript
// Colors
--primary: #3b82f6
--success: #10b981
--danger: #ef4444
--warning: #f59e0b
--info: #0ea5e9
--bg-light: #f8fafc
--bg-white: #ffffff
--border-color: #e2e8f0
--text-dark: #1e293b
--text-muted: #64748b

// Shadows
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

// Spacing
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px

// Border radius
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
```

## Common Patterns

### Horizontal Rule
```jsx
<div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: 'var(--spacing-md)' }} />
```

### Icon + Text Button
```jsx
<button className="btn btn-primary">
  🎫 Book Now
</button>
```

### Inline Icon + Label
```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
  <span>📍</span>
  <span>123 Main Street</span>
</div>
```

### Card with Image
```jsx
<div className="card">
  <div className="aspect-video image-container">
    <img src="image.jpg" alt="Title" />
  </div>
  <div className="card-content">
    <h4>Title</h4>
    <p>Description</p>
  </div>
</div>
```

### Form with Validation Message
```jsx
<div className="form-group">
  <label>Email</label>
  <input type="email" />
  {error && <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
    {error}
  </div>}
</div>
```

### Loading Spinner
```jsx
<div className="spinner"></div>
```

### Modal Dialog
```jsx
{showModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
      <div className="card-header">
        <h4>Modal Title</h4>
      </div>
      <div className="card-content">
        Modal content
      </div>
    </div>
  </div>
)}
```

## Tips for Teammates

1. **Always use CSS variables** for colors and spacing - makes theming easy!
2. **Use flexbox/grid for layouts** - avoid absolute positioning unless necessary
3. **Keep components reusable** - extract common patterns into smaller components
4. **Use semantic HTML** - `<button>` instead of `<div>` for buttons
5. **Test on mobile** - use responsive utility classes
6. **Check `styles.css`** for all available utilities
7. **Copy working examples** - check existing components for patterns

## Responsive Breakpoints

- **Desktop**: No media queries (default)
- **Mobile** (< 768px): Adjust `gridTemplateColumns` from `repeat(3, 1fr)` to `1fr`

Example:
```jsx
const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)'
  }
};

<div style={styles.grid}>
  {/* Auto-responsive grid */}
</div>
```

---

**Need more examples? Check the component files in `src/components/` for real usage patterns!**
