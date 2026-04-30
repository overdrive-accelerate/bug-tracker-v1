export type PropertyType =
    | "text"
    | "number"
    | "select"
    | "multiSelect"
    | "status"
    | "date"
    | "checkbox"
    | "url"
    | "phone"
    | "email"
    | "person"
    | "file"
    | "progress"
    | "id"
    | "createdTime"
    | "updatedTime"
    | "createdBy"
    | "lastEditedBy";

/** Property types that are auto-populated and should not be editable */
export const AUTO_PROPERTY_TYPES: PropertyType[] = [
    "createdTime",
    "updatedTime",
    "createdBy",
    "lastEditedBy",
    "id",
];

/** Human-readable labels for property types */
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
    text: "Text",
    number: "Number",
    select: "Select",
    multiSelect: "Multi-select",
    status: "Status",
    date: "Date",
    checkbox: "Checkbox",
    url: "URL",
    phone: "Phone",
    email: "Email",
    person: "Person",
    file: "Files & media",
    progress: "Progress",
    id: "ID",
    createdTime: "Created time",
    updatedTime: "Last edited time",
    createdBy: "Created by",
    lastEditedBy: "Last edited by",
};

export interface PropertyDefinition {
    id: string;
    name: string;
    type: PropertyType;
    options?: string[]; // for select / multiSelect
}

export type FilterOperator =
    | "contains"
    | "does_not_contain"
    | "is"
    | "is_not"
    | "is_empty"
    | "is_not_empty"
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "greater_than_or_equal"
    | "less_than_or_equal"
    | "is_before"
    | "is_after"
    | "is_checked"
    | "is_not_checked";

export interface FilterRule {
    id: string;
    propertyId: string;
    operator: FilterOperator;
    value: string;
}

/** Operators available for each property type */
export const OPERATORS_BY_TYPE: Record<PropertyType, { value: FilterOperator; label: string }[]> = {
    text: [
        { value: "contains", label: "Contains" },
        { value: "does_not_contain", label: "Does not contain" },
        { value: "is", label: "Is" },
        { value: "is_not", label: "Is not" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    number: [
        { value: "equals", label: "=" },
        { value: "not_equals", label: "≠" },
        { value: "greater_than", label: ">" },
        { value: "less_than", label: "<" },
        { value: "greater_than_or_equal", label: "≥" },
        { value: "less_than_or_equal", label: "≤" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    select: [
        { value: "is", label: "Is" },
        { value: "is_not", label: "Is not" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    multiSelect: [
        { value: "contains", label: "Contains" },
        { value: "does_not_contain", label: "Does not contain" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    status: [
        { value: "is", label: "Is" },
        { value: "is_not", label: "Is not" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    date: [
        { value: "is", label: "Is" },
        { value: "is_before", label: "Is before" },
        { value: "is_after", label: "Is after" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    checkbox: [
        { value: "is_checked", label: "Is checked" },
        { value: "is_not_checked", label: "Is not checked" },
    ],
    url: [
        { value: "contains", label: "Contains" },
        { value: "does_not_contain", label: "Does not contain" },
        { value: "is", label: "Is" },
        { value: "is_not", label: "Is not" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    phone: [
        { value: "contains", label: "Contains" },
        { value: "does_not_contain", label: "Does not contain" },
        { value: "is", label: "Is" },
        { value: "is_not", label: "Is not" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    email: [
        { value: "contains", label: "Contains" },
        { value: "does_not_contain", label: "Does not contain" },
        { value: "is", label: "Is" },
        { value: "is_not", label: "Is not" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    person: [
        { value: "contains", label: "Contains" },
        { value: "does_not_contain", label: "Does not contain" },
        { value: "is", label: "Is" },
        { value: "is_not", label: "Is not" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    file: [
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    progress: [
        { value: "equals", label: "=" },
        { value: "not_equals", label: "≠" },
        { value: "greater_than", label: ">" },
        { value: "less_than", label: "<" },
        { value: "greater_than_or_equal", label: "≥" },
        { value: "less_than_or_equal", label: "≤" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    id: [
        { value: "contains", label: "Contains" },
        { value: "does_not_contain", label: "Does not contain" },
        { value: "is", label: "Is" },
        { value: "is_not", label: "Is not" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    createdTime: [
        { value: "is", label: "Is" },
        { value: "is_before", label: "Is before" },
        { value: "is_after", label: "Is after" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    updatedTime: [
        { value: "is", label: "Is" },
        { value: "is_before", label: "Is before" },
        { value: "is_after", label: "Is after" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    createdBy: [
        { value: "contains", label: "Contains" },
        { value: "does_not_contain", label: "Does not contain" },
        { value: "is", label: "Is" },
        { value: "is_not", label: "Is not" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
    lastEditedBy: [
        { value: "contains", label: "Contains" },
        { value: "does_not_contain", label: "Does not contain" },
        { value: "is", label: "Is" },
        { value: "is_not", label: "Is not" },
        { value: "is_empty", label: "Is empty" },
        { value: "is_not_empty", label: "Is not empty" },
    ],
};

export interface ViewConfig {
    id: string;
    name: string;
    type: "table" | "board" | "list";
    groupByPropertyId?: string; // for board view
    filters?: FilterRule[];
}

export interface RowValues {
    [propertyId: string]: unknown;
}
