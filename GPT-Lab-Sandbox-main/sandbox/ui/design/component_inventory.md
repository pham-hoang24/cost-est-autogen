# Component Inventory

## 1. Core Layout Components

### `WizardStepper`
-   **Description**: Visual indicator of progress.
-   **Props**:
    -   `currentStep`: number
    -   `steps`: Array<{ label: string, id: number }>
    -   `onStepClick`: (step: number) => void
-   **Usage**: Placed at the top of the main container.

### `SummarySidebar`
-   **Description**: Displays a running summary of project context.
-   **Props**:
    -   `data`: ProjectBasicsData
    -   `currentEstimate`: EstimateResult | null
-   **Usage**: Right column on desktop, collapsible drawer on mobile.

## 2. Form Components

### `SelectField`
-   **Description**: Label + Select Dropdown + Tooltip.
-   **Props**:
    -   `label`: string
    -   `value`: string
    -   `options`: Array<{ label: string, value: string }>
    -   `onChange`: (value: string) => void
    -   `tooltip`: string
    -   `error`: string

### `MultiSelectField`
-   **Description**: For Tech Stack selection (Tags).
-   **Props**:
    -   `label`: string
    -   `selected`: string[]
    -   `options`: string[]
    -   `onChange`: (values: string[]) => void

### `MethodCard`
-   **Description**: Selectable card for Step 2.
-   **Props**:
    -   `method`: { id, name, description, tags }
    -   `selected`: boolean
    -   `onSelect`: () => void
    -   `isHybrid`: boolean (Special styling)

## 3. Result & Visualization Components

### `EstimateSummaryCard`
-   **Description**: High-level result display.
-   **Props**:
    -   `cost`: number | { low, high }
    -   `effort`: number
    -   `duration`: number
    -   `currency`: string
    -   `confidence`: 'low' | 'medium' | 'high'

### `MethodContributionTable`
-   **Description**: Table for Hybrid method breakdown.
-   **Props**:
    -   `contributions`: Array<{ method, estimate, weight, confidence }>

### `MissingInputsList`
-   **Description**: Interactive checklist for required data.
-   **Props**:
    -   `inputs`: Array<{ id, label, description }>
    -   `values`: Record<string, any>
    -   `onChange`: (id, value) => void

## 4. Feedback & Status

### `InterpreterPreview`
-   **Description**: Natural language summary of inputs.
-   **Props**:
    -   `inputs`: ProjectBasicsData

### `StatusBanner`
-   **Description**: Alert/Banner for state (Waiting, Ready, Error).
-   **Props**:
    -   `status`: 'idle' | 'loading' | 'success' | 'error'
    -   `message`: string

## 5. Existing Reusable Components (from codebase)
-   `Card`: Base container.
-   `Button`: Actions.
-   `Badge`: Tags/Status.
-   `Icons` (Lucide): `Info`, `Check`, `AlertTriangle`, etc.
