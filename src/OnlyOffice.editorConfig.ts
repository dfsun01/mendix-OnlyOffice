import { OnlyOfficePreviewProps } from "../typings/OnlyOfficeProps";

export type Platform = "web" | "desktop";

export type Properties = PropertyGroup[];

type PropertyGroup = {
    caption: string;
    propertyGroups?: PropertyGroup[];
    properties?: Property[];
};

type Property = {
    key: string;
    caption: string;
    description?: string;
    objectHeaders?: string[];
    objects?: ObjectProperties[];
    properties?: Properties[];
};

type ObjectProperties = {
    properties: PropertyGroup[];
    captions?: string[];
};

export type Problem = {
    property?: string;
    severity?: "error" | "warning" | "deprecation";
    message: string;
    studioMessage?: string;
    url?: string;
    studioUrl?: string;
};

export function getProperties(_values: OnlyOfficePreviewProps, defaultProperties: Properties): Properties {
    return defaultProperties;
}

export function check(values: OnlyOfficePreviewProps): Problem[] {
    const warnings: Problem[] = [];

    if (values.mode === "view" && values.canEdit) {
        warnings.push({
            property: "canEdit",
            severity: "warning",
            message: "Edit permission is ignored while the editor mode is View."
        });
    }

    return warnings;
}
