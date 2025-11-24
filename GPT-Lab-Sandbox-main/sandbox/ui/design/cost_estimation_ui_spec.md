# Cost Estimation UI Design Specification

## 1. Overall Concept & Analysis
The Cost Estimation UI is designed to be embedded within the existing Sandbox environment. It leverages the existing design system (Tailwind CSS, dark mode, Card/Button components) to ensure consistency.

### Existing Design Analysis
- **Structure**: The current `ProfessionalCostEstimationService.tsx` uses a step-based wizard approach.
- **Styling**: Dark theme with `bg-gray-900` (implied background) and `bg-gray-700` for cards/inputs. Text is primarily `text-white` or `text-gray-400`.
- **Components**:
    - `Card`: Main container for content blocks.
    - `Button`: Primary (blue) and secondary (gray/outline) actions.
    - `Badge`: Status and category indicators.
    - `lucide-react`: Consistent iconography.
    - `recharts`: Data visualization.
- **State**: React `useState` manages the current step and form data.

### New Design Concept
The new design refines the wizard into three distinct steps focused on user guidance and flexibility (Single vs. Hybrid methods).

**Core Flow:**
1.  **Step 1: Project Basics** (Baseline data collection)
2.  **Step 2: Method Selection** (Choose specific or Hybrid)
3.  **Step 3:**
    -   **3A: Single Method Configuration** (Detailed inputs & results)
    -   **3B: Hybrid Quick Estimate** (Automated blended results)

---

## 2. Screen-by-Screen Description

### Persistent Elements
-   **Stepper**: Located at the top.
    -   Visual: Horizontal row of circles connected by lines.
    -   States: Active (Blue/Highlighted), Completed (Checkmark/Green), Pending (Gray).
    -   Labels: "1. Basics", "2. Method", "3. Estimate".
    -   Behavior: Clickable to navigate back to completed steps.
-   **Summary Sidebar / Panel**: (Responsive: Right column on Desktop, Collapsible/Bottom on Mobile)
    -   Content: "Project Context" summary.
    -   Updates dynamically as the user fills Step 1.

### Step 1: Project Basics
**Goal**: Establish the baseline parameters for the project.

**Layout**:
-   **Left Column (Form)**:
    -   `Project Type` [Select]: Web app, Mobile app, API backend, Desktop app, Other.
    -   `Complexity` [Select]: Simple, Moderate, Complex, Very complex.
    -   `Tech Stack` [Multi-Select/Tags]: React, .NET, Java, Python, Node.js, etc.
    -   `Team Preference` [Select]: Client team only, Vendor team only, Mixed, No preference.
    -   `Region` [Select]: North America, Western Europe, Eastern Europe, Asia-Pacific, etc.
    -   `Duration` [Select]: < 3 months, 3–6 months, 6–12 months, > 12 months.
    -   *UX Note*: Each field has an info icon (Tooltip) explaining its impact.

-   **Right Column (Context)**:
    -   **Interpreter Preview Card**: A dynamic text block.
        -   *Example*: "You are estimating a **Complex** **Web Application** to be built in **Western Europe**."
    -   **Action Bar**:
        -   Primary: "Continue to Step 2" (Disabled until valid).
        -   Secondary: "Reset Form".

**State Transitions**:
-   `onContinue` -> Validate fields -> Navigate to Step 2.

### Step 2: Choose Estimation Method
**Goal**: Allow the user to select a specific methodology or a quick hybrid approach.

**Layout**:
-   **Header**: "Choose one or more estimation methods..."
-   **Method Grid** (2-3 columns):
    -   **Standard Cards**: COCOMO, FPA, Story Points, Parametric, Bottom-up, Analogous.
        -   Content: Icon, Title, Description, Tags (e.g., "Data-hungry").
        -   Action: "Select" button (Toggles selection).
    -   **Hybrid Card** (Featured/Distinct):
        -   Visual: Distinct border color (e.g., Gold/Yellow) or Badge "Recommended for Speed".
        -   Content: "Hybrid Method (Quick & Rough)". "Uses blended assumptions for a rapid estimate."
        -   Action: "Use Hybrid Method".

**Interactions**:
-   Selecting a **Single Method** highlights it.
-   Selecting **Hybrid** deselects others (or is a distinct primary action).
-   **Primary Action**: "Continue with [Selected Method]" or "Generate Hybrid Estimate".

**State Transitions**:
-   `onSelect(Method)` -> Update `selectedMethod`.
-   `onContinue` ->
    -   If Hybrid -> Navigate to Step 3B.
    -   If Single -> Navigate to Step 3A.

### Step 3A: Single Method Configuration (e.g., COCOMO)
**Goal**: Gather method-specific details and show results.

**Layout**:
-   **Left Panel (Inputs)**:
    -   Header: Method Name + "What is needed?" link.
    -   **Dynamic Form**:
        -   Pre-filled fields from Step 1 (Read-only or Editable).
        -   Method-specific fields (e.g., KLOC for COCOMO).
    -   **Missing Inputs List** (If applicable):
        -   Visual: Warning block "Required details missing".
        -   Items: Field Label + Inline Input.
    -   Action: "Calculate Estimate" / "Check Inputs".

-   **Right Panel (Results)**:
    -   **Status Banner**: "Waiting for inputs" / "Estimate Ready".
    -   **Result Card** (When ready):
        -   Total Cost (Currency).
        -   Effort (Person-months).
        -   Duration.
    -   **Explanation**: Text block explaining assumptions/logic.
    -   **Actions**: "Recalculate", "Export".

**State Transitions**:
-   `onCalculate` -> Call Backend -> Show Loading -> Show Results or Errors.

### Step 3B: Hybrid Method Flow
**Goal**: Provide a quick, blended estimate with minimal friction.

**Layout**:
-   **Initial State**: Loading overlay "Running multi-agent simulation...".
-   **Results View**:
    -   **Composite Estimate Card**:
        -   Large Total Cost range.
        -   Confidence Badge (Low/Medium/High) with Tooltip.
    -   **Method Contribution Table**:
        -   Columns: Method Name, Estimate, Weight, Confidence.
    -   **Assumptions Panel**:
        -   List of inferred values (e.g., "Assumed Team Size: 5").
        -   Editable: Users can tweak these and "Re-run".

**Actions**:
-   "Refine with [Method]" -> Navigates to Step 3A for that method.
-   "Save/Export".

---

## 3. State Management & Data Flow

### Global State (Context or Parent Component)
-   `step`: number (1, 2, 3)
-   `subStep`: string ('a', 'b') // for 3A/3B
-   `baselineData`: { projectType, complexity, stack, ... }
-   `selectedMethod`: string | 'hybrid'
-   `methodInputs`: Record<string, any> // Stores specific inputs for each method
-   `estimates`: Record<string, Result> // Cache results

### Error Handling
-   **Network/Backend Errors**: Show Toast notification + Inline error message in the relevant panel.
-   **Validation Errors**: Inline red text below form fields. Disable "Continue" buttons.

### Loading States
-   **Button Loading**: Spinners inside buttons during async actions.
-   **Full Panel Loading**: Skeleton loaders for the Results panel while fetching estimates.
