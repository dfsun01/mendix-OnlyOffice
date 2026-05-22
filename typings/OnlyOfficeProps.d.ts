/**
 * This file was generated from OnlyOffice.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue } from "mendix";

export type DocumentTypeEnum = "word" | "cell" | "slide" | "pdf";

export type ModeEnum = "edit" | "view";

export type EditorTypeEnum = "desktop" | "mobile" | "embedded";

export interface OnlyOfficeContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    documentServerUrl: DynamicValue<string>;
    token?: DynamicValue<string>;
    documentUrl: DynamicValue<string>;
    documentKey?: DynamicValue<string>;
    documentTitle?: DynamicValue<string>;
    fileType?: DynamicValue<string>;
    documentType: DocumentTypeEnum;
    mode: ModeEnum;
    editorType: EditorTypeEnum;
    language?: DynamicValue<string>;
    callbackUrl?: DynamicValue<string>;
    height: number;
    userId?: DynamicValue<string>;
    userName?: DynamicValue<string>;
    canEdit: boolean;
    canDownload: boolean;
    canPrint: boolean;
    canReview: boolean;
    canComment: boolean;
    onReady?: ActionValue;
    onDocumentStateChange?: ActionValue;
    onError?: ActionValue;
}

export interface OnlyOfficePreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    documentServerUrl: string;
    token: string;
    documentUrl: string;
    documentKey: string;
    documentTitle: string;
    fileType: string;
    documentType: DocumentTypeEnum;
    mode: ModeEnum;
    editorType: EditorTypeEnum;
    language: string;
    callbackUrl: string;
    height: number | null;
    userId: string;
    userName: string;
    canEdit: boolean;
    canDownload: boolean;
    canPrint: boolean;
    canReview: boolean;
    canComment: boolean;
    onReady: {} | null;
    onDocumentStateChange: {} | null;
    onError: {} | null;
}
