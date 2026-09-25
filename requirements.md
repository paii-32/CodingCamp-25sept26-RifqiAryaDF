# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to record, view, and analyze personal spending. Users enter transactions with a name, amount, and category; the application stores all data in the browser's Local Storage and presents a real-time summary through a transaction list, a running total, and a pie chart. The application also supports dark/light mode theming, transaction sorting, and a configurable spending limit with visual alerts.

The application is built with HTML, CSS, and Vanilla JavaScript only — no frameworks or backend server.

---

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single spending record consisting of an item name, a monetary amount, and a category.
- **Transaction_List**: The scrollable UI component that displays all stored transactions.
- **Input_Form**: The HTML form component used to submit new transactions.
- **Validator**: The client-side logic that checks Input_Form fields before submission.
- **Storage**: The browser Local Storage API used to persist transaction data.
- **Category**: A label assigned to a transaction; default values are Food, Transport, and Fun.
- **Total_Display**: The UI element at the top of the page showing the cumulative spending total.
- **Chart**: The pie chart component (implemented with Chart.js) that visualizes spending by Category.
- **Sorter**: The client-side logic that reorders the Transaction_List based on user-selected criteria.
- **Budget_Limit**: A user-defined monetary threshold used to flag excessive spending.
- **Theme_Controller**: The client-side logic that switches the UI between dark and light mode.

---

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to fill in a form with item name, amount, and category so that I can record a new spending transaction.

#### Acceptance Criteria

1. THE Input_Form SHALL provide a text field for item name accepting up to 100 characters, a numeric field for amount, and a dropdown selector for Category.
2. THE Input_Form SHALL include the default Category options: Food, Transport, and Fun, with no option pre-selected by default.
3. WHEN the user submits the Input_Form, THE Validator SHALL verify that the item name field is not empty and does not exceed 100 characters.
4. WHEN the user submits the Input_Form, THE Validator SHALL verify that the amount field contains a numeric value between 0.01 and 999,999,999.99.
5. WHEN the user submits the Input_Form, THE Validator SHALL verify that a Category has been selected from the dropdown.
6. IF any Input_Form field fails validation, THEN THE Validator SHALL display an inline error message adjacent to each invalid field indicating the specific validation rule violated, and SHALL NOT submit the transaction.
7. WHEN all Input_Form fields pass validation, THE App SHALL add the transaction to the Transaction_List within 1 second and clear all Input_Form fields to their default empty state.

---

### Requirement 2: Transaction List Display

**User Story:** As a user, I want to see all my recorded transactions in a scrollable list so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each transaction showing item name (up to 100 characters), amount (formatted as a decimal number with 2 decimal places), and Category.
2. THE Transaction_List SHALL be scrollable when the number of entries exceeds the visible area, supporting at least 1000 transaction entries.
3. WHEN a new transaction is added, THE Transaction_List SHALL display the new entry at the top of the list within 1 second without requiring a page reload.
4. THE Transaction_List SHALL provide a delete control for each transaction entry.
5. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from the Transaction_List and from Storage within 2 seconds.
6. IF Storage is unavailable when the user activates the delete control, THEN THE App SHALL display an error message indicating the deletion failed and retain the transaction in the Transaction_List.
7. WHEN the Transaction_List contains no entries, THE Transaction_List SHALL display a message indicating no transactions have been recorded.

---

### Requirement 3: Total Balance Display

**User Story:** As a user, I want to see my total spending at the top of the page so that I can quickly understand how much I have spent overall.

#### Acceptance Criteria

1. THE Total_Display SHALL show the sum of the amount values of all transactions currently in Storage, rounded to 2 decimal places.
2. WHEN a transaction is added, THE Total_Display SHALL update to reflect the new sum within the same render cycle.
3. WHEN a transaction is deleted, THE Total_Display SHALL update to reflect the reduced sum within the same render cycle.
4. WHEN no transactions exist, THE Total_Display SHALL show a value of zero.
5. IF Storage contains a transaction with a missing or non-numeric amount value, THEN THE App SHALL exclude that record from the Total_Display sum and log a warning to the browser console.

---

### Requirement 4: Pie Chart Visualization

**User Story:** As a user, I want to see a pie chart of my spending by category so that I can understand how my money is distributed.

#### Acceptance Criteria

1. THE Chart SHALL render a pie chart that groups transaction amounts by Category and displays each group as a proportional segment, where each segment's arc length corresponds to that Category's percentage of the total transaction amount.
2. WHEN a transaction is added, THE Chart SHALL re-render to reflect the updated Category totals within 1 second of the transaction being saved.
3. WHEN a transaction is deleted, THE Chart SHALL re-render to reflect the updated Category totals within 1 second of the deletion being confirmed.
4. WHEN all transactions are deleted, THE Chart SHALL display a placeholder state containing a message indicating no spending data is available.
5. THE Chart SHALL assign a distinct color to each Category segment such that no two segments share the same color, supporting up to 10 simultaneous Category segments.
6. IF the number of categories exceeds 10, THEN THE Chart SHALL group all categories beyond the top 10 by total amount into a single segment labeled "Other".

---

### Requirement 5: Client-Side Data Persistence

**User Story:** As a user, I want my transactions to be saved in the browser so that my data is available when I reopen the page.

#### Acceptance Criteria

1. WHEN a transaction is added, THE Storage SHALL persist the transaction data to the browser Local Storage under a fixed storage key, including all transaction fields (item name, amount, and category).
2. WHEN a transaction is deleted, THE Storage SHALL remove the corresponding transaction record from the browser Local Storage such that the record no longer exists under that storage key.
3. WHEN the App initializes, THE App SHALL read all transaction records from Storage and populate the Transaction_List, Total_Display, and Chart within 500 milliseconds.
4. IF the browser Local Storage is unavailable or returns a parse error on initialization, THEN THE App SHALL initialize with an empty Transaction_List and display an error message indicating that saved data could not be loaded.
5. THE App SHALL NOT transmit transaction data to any external server or remote endpoint.

---

### Requirement 6: Responsive and Mobile-Friendly Layout

**User Story:** As a user, I want the application to be usable on both desktop and mobile devices so that I can record expenses on any device.

#### Acceptance Criteria

1. THE App SHALL render a usable layout on viewport widths from 320px to 1920px without horizontal scrolling.
2. WHILE the viewport width is less than or equal to 768px, THE App SHALL stack all form inputs, buttons, and data display elements vertically such that no element requires horizontal scrolling to interact with.
3. THE App SHALL use a single CSS file located at `css/` for all visual styling.
4. THE App SHALL use a single JavaScript file located at `js/` for all application logic.
5. WHEN the App is loaded in the latest stable version of Chrome, Firefox, Safari, or Edge, THE App SHALL render the initial view with all interactive elements visible and operable and with zero JavaScript errors reported in the browser console.

---

### Requirement 7: Transaction Sorting

**User Story:** As a user, I want to sort my transaction list by amount or by category so that I can organize my spending view to suit my needs.

#### Acceptance Criteria

1. THE App SHALL provide a sort control that offers the following options: amount ascending, amount descending, category A-Z, and a default (chronological) option.
2. WHEN the user selects a sort option, THE App SHALL reorder the Transaction_List entries according to the selected criterion within 500 milliseconds.
3. WHEN two or more transactions share the same amount value and the active sort criterion is amount ascending or amount descending, THE App SHALL display those transactions ordered by the date they were added, from oldest to newest.
4. WHEN two or more transactions share the same category name and the active sort criterion is category A-Z, THE App SHALL display those transactions ordered by the date they were added, from oldest to newest.
5. WHEN a new transaction is added while a sort option is active, THE App SHALL apply the active sort criterion to the updated Transaction_List within 500 milliseconds.
6. WHEN the user selects the default sort option, THE App SHALL display the Transaction_List in the order transactions were added, from oldest to newest.

---

### Requirement 8: Spending Limit Highlight

**User Story:** As a user, I want to set a spending limit and be visually warned when I exceed it so that I can stay within my budget.

#### Acceptance Criteria

1. THE App SHALL provide an input field that allows the user to set a Budget_Limit as a positive numeric value between 0.01 and 999,999,999.99, rejecting any non-numeric, zero, or negative input with an error message indicating the value is invalid.
2. WHEN the total spending in the Total_Display meets or exceeds the Budget_Limit, THE App SHALL apply a warning visual style to the Total_Display that is visually distinct from the normal style by changing at least one visible attribute (such as text color, background color, or a warning icon).
3. WHEN the total spending in the Total_Display falls below the Budget_Limit, THE App SHALL remove the warning visual style from the Total_Display and restore its normal visual style.
4. WHEN the user updates the Budget_Limit value, THE App SHALL re-evaluate and update the Total_Display visual style within 300 milliseconds of the Budget_Limit change.
5. THE Storage SHALL persist the Budget_Limit value so that it is restored when the App initializes.
6. IF the Budget_Limit value cannot be loaded from Storage during App initialization, THEN THE App SHALL initialize with no Budget_Limit set and display the Total_Display in its normal visual style.

---

### Requirement 9: Dark/Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light UI themes so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL provide a toggle control that switches the UI between dark mode and light mode, and the toggle control SHALL visually indicate the currently active theme at all times.
2. WHEN the user activates the toggle control, THE Theme_Controller SHALL apply the selected theme to all visible UI elements within the same render cycle, such that no UI element retains the previous theme's color scheme after the cycle completes.
3. THE Theme_Controller SHALL apply contrasting color schemes for dark and light modes such that all text maintains a minimum contrast ratio of 4.5:1 against its background in both modes.
4. WHEN the user activates the toggle control, THE Storage SHALL persist the selected theme preference, overwriting any previously stored value.
5. WHEN the App initializes, IF a valid theme preference exists in Storage, THEN THE App SHALL apply that stored theme before rendering any UI element.
6. WHEN no theme preference exists in Storage, THE App SHALL initialize in light mode by default.
