# Application Specifications - Shop Billing System

## Overview
A dual-pane billing application for departmental/stationary shops with customer-specific pricing tiers. Designed for non-technical staff with large, touch-friendly interfaces.

---

## 1. Navigation Structure

### Main Navigation
- **Home Page**: Primary billing interface (default view)
- **Configuration Page**: Settings and data management (accessible via prominent button)

**Navigation Flow**: Home Page ↔ Configuration Page (via dedicated "Settings" button)

---

## 2. Configuration Page

### Section A: Customer Management
**Location**: Configuration Page - Top Section

**Functionality**:
- **Add Customer**: Form with fields:
  - Customer Name (required, text input)
  - Customer Type (required, dropdown: Retail, Wholesale, Bank, Mill, etc.)
  - Contact Number (optional)
  - GST Number (optional)
  
- **Edit Customer**: Click any customer row to populate edit form above the list
- **Delete Customer**: Delete button per row with confirmation dialog
- **Customer List**: Scrollable table showing all customers with search/filter

**UI Requirements**:
- Large input fields (minimum 40px height)
- Primary action buttons in green
- Delete buttons in red with confirmation
- Search box at top of customer list

### Section B: Product Management
**Location**: Configuration Page - Bottom Section

**Functionality**:
- **Add Product**: Form with fields:
  - Product Name (required)
  - Product Category (dropdown: Stationery, Books, etc.)
  - Barcode/Item Code (optional)
  - **Price Grid**: Dynamic table showing one row per customer type with price input
  
- **Edit Product**: Click product row to populate edit form
- **Delete Product**: Delete button per row with confirmation
- **Product List View**: Separate tab/page showing all products

**Price Configuration**:
Product: "Unruled Note"
├─ Retail: ₹45.00
├─ Wholesale: ₹38.00
├─ Bank: ₹42.00
└─ Mill: ₹35.00


**UI Requirements**:
- Price grid visible immediately when adding/editing
- Large numeric input fields for prices
- Currency format automatically applied

### Section C: Product List View
**Location**: Separate tab or scrollable section within Configuration Page

**Functionality**:
- **Search Bar**: Real-time search by product name or code
- **Filter**: By category
- **Sort**: By name, price, or category
- **Display**: Grid or table view showing:
  - Product name
  - Category
  - All configured prices (collapsed by default, expandable)
  - Edit/Delete actions

**UI Requirements**:
- Search shows results as you type (no button press needed)
- Large clear fonts for product names
- Price indicators color-coded by customer type

---

## 3. Home Page (Billing Interface)

### Layout: Two-Panel Design

**Left Panel (40% width)**: Customer & Product Selection
**Right Panel (60% width)**: Invoice/Bill Generation

---

### Left Panel: Product Selection Area

#### Top Section: Customer Selector
**Location**: Top of left panel

**Functionality**:
- **Dropdown/Search**: Select customer (shows name + type)
- **Customer Type Badge**: Displays selected customer's type prominently
- **Clear Selection**: Button to change customer

**Behavior**:
- Customer MUST be selected before products are visible
- Product cards update automatically when customer changes
- Prices shown are specific to selected customer

#### Bottom Section: Product Cards Grid
**Location**: Below customer selector (main portion of left panel)

**Functionality**:
- **Product Cards**: Grid layout with large, clickable cards
- **Card Content**:
  - Product name (large, bold text)
  - Price for selected customer (prominent display)
  - Category (small badge)
  - Stock indicator (if tracking inventory)
  
- **Card Actions**:
  - Single click: Add 1 unit to bill
  - Double click: Add 5 units (wholesale shortcut)
  - Long press: Show quantity input modal

**Search/Filter**:
- Search box above product cards
- Filter by category (dropdown or pill buttons)
- Recently added products appear first

**UI Requirements**:
- Minimum 3-4 cards visible without scrolling
- Cards minimum 120px height for easy clicking
- Price displayed in large, green text
- Hover/touch feedback (color change or shadow)

---

### Right Panel: Invoice Generation Area

#### Top Section: Invoice Header
**Location**: Top of right panel

**Content**:
- Invoice Number (auto-generated, sequential)
- Date & Time (auto-filled, editable if needed)
- Selected Customer Name & Type (large, clear)
- Shop Name/Logo (configurable)

#### Middle Section: Bill Items List
**Location**: Center of right panel (scrollable)

**Functionality**:
- **Item Rows**: For each product added:
  - Product name
  - Quantity (editable, click to change)
  - Rate (customer-specific price)
  - Amount (auto-calculated)
  - Delete button (red X icon)
  
- **Running Calculations**:
  - Subtotal
  - GST Breakdown (CGST, SGST)
  - Total Amount (large, prominent)

**UI Requirements**:
- Large, clear fonts for amounts
- Quantity editable by clicking (no separate edit mode)
- Running total updates instantly
- Delete button requires confirmation for wholesale quantities

#### Bottom Section: Action Buttons
**Location**: Bottom of right panel (fixed position)

**Buttons**:
1. **Print Bill** (Large, Green button)
   - Triggers printer dialog
   - Saves invoice to history
   - Clears current bill
   
2. **New Bill** (Large, Blue button)
   - Clears current items
   - Keeps same customer (or prompts to change)
   - Generates new invoice number

3. **Settings** (Medium, Gray button)
   - Navigates to Configuration Page

**UI Requirements**:
- Buttons minimum 50px height
- Print button most prominent (green)
- Clear visual separation from invoice items
- Disabled state when no items in bill

---

## 4. Overall UI/UX Requirements

### Visual Design
- **Color Scheme**: High contrast, light background, dark text
- **Font Sizes**:
  - Body text: 16px minimum
  - Buttons: 18px minimum
  - Headings: 20px+ minimum
  - Prices: 24px+ (very prominent)
- **Spacing**: Generous padding (minimum 15px between elements)
- **Icons**: Simple, universally understood icons with text labels

### Interaction Patterns
- **Click Targets**: Minimum 44x44px for all interactive elements
- **Feedback**: Immediate visual feedback for all clicks/taps
- **Confirmation**: Required for all deletions and bill finalization
- **Auto-Save**: All data saves automatically (no save buttons)
- **Error Handling**: Friendly messages with solutions, not technical errors

### Accessibility
- **Keyboard Navigation**: Tab order logical, Enter key works for primary actions
- **Screen Reader**: Proper labels and ARIA attributes
- **Touch**: All elements touch-friendly for touchscreen monitors
- **Vision**: High contrast mode compatibility

### Performance
- **Load Time**: Home page loads in under 2 seconds
- **Search**: Real-time search results appear in under 200ms
- **Printing**: Bill prints within 5 seconds of click
- **Offline**: Full functionality without internet connection

---

## 5. Data Persistence Requirements

### Local Storage Strategy
- Customer data: Store locally
- Product catalog: Store locally
- Price history: Full audit trail
- Invoice history: All bills stored locally with search capability

### Backup System
- **Manual Backup**: Button in Configuration Page
- **Auto-Backup**: Daily at shop closing time (configurable)
- **Backup Location**: USB drive or local network folder
- **Restore**: One-click restore from backup file

---

## 6. User Training Considerations

### Learning Curve
- **Initial Setup**: 30 minutes with shop owner
- **Staff Training**: 15 minutes per person
- **Reference Guide**: One-page visual quick reference

### Onboarding Features
- **First Launch**: Setup wizard for shop name, first customer, first product
- **Tooltips**: Contextual help for first-time users (dismissable)
- **Sample Data**: Pre-loaded with 5-10 common products as examples

---

## 7. Success Criteria

### Functional Success
- Customer can be selected in under 5 seconds
- Product can be added to bill in under 3 seconds
- New product can be configured in under 2 minutes
- Staff can generate a bill with 10 items in under 60 seconds

### Business Success
- All customer types charged correct prices automatically
- Zero pricing errors after first week of use
- Daily reports generated in under 1 minute
- Backup/restore process tested and verified

---

**Implementation Note**: The agent should reference this specification file when implementing features and ensure all UI/UX requirements for non-technical users are strictly followed.
