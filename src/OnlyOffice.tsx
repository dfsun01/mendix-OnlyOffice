import { ReactElement, useEffect, useId, useMemo, useRef, useState } from "react";
import { DynamicValue, ValueStatus } from "mendix";

import { DocumentTypeEnum, OnlyOfficeContainerProps } from "../typings/OnlyOfficeProps";

import "./ui/OnlyOffice.css";

type DocEditor = {
    destroyEditor?: () => void;
};

type DocsApi = {
    DocEditor: new (placeholderId: string, config: OnlyOfficeConfig) => DocEditor;
};

type OnlyOfficeConfig = {
    type: "desktop" | "mobile" | "embedded";
    width: string;
    height: string;
    documentType: "word" | "cell" | "slide" | "pdf";
    document: {
        fileType: string;
        key: string;
        title: string;
        url: string;
        permissions: {
            edit: boolean;
            download: boolean;
            print: boolean;
            review: boolean;
            comment: boolean;
        };
    };
    editorConfig: {
        callbackUrl?: string;
        lang?: string;
        mode: "edit" | "view";
        user?: {
            id?: string;
            name?: string;
        };
    };
    token?: string;
    events: {
        onAppReady?: () => void;
        onDocumentStateChange?: () => void;
        onError?: () => void;
    };
};

declare global {
    interface Window {
        DocsAPI?: DocsApi;
    }
}

const loadedScripts = new Map<string, Promise<void>>();

function getValue(value?: DynamicValue<string>): string | undefined {
    if (!value || value.status === ValueStatus.Unavailable) {
        return undefined;
    }

    return value.value?.trim() || undefined;
}

function normalizeServerUrl(url: string): string {
    return url.replace(/\/+$/, "");
}

function decodeUrlPart(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function getFileNameFromUrl(documentUrl?: string): string | undefined {
    if (!documentUrl) {
        return undefined;
    }

    try {
        const url = new URL(documentUrl, window.location.origin);
        const queryFileName =
            url.searchParams.get("filename") || url.searchParams.get("fileName") || url.searchParams.get("name");

        if (queryFileName) {
            return decodeUrlPart(queryFileName);
        }

        const pathFileName = url.pathname.split("/").filter(Boolean).pop();
        return pathFileName ? decodeUrlPart(pathFileName) : undefined;
    } catch {
        const pathWithoutQuery = documentUrl.split(/[?#]/)[0];
        const fileName = pathWithoutQuery.split("/").filter(Boolean).pop();
        return fileName ? decodeUrlPart(fileName) : undefined;
    }
}

function getFileTypeFromName(fileName?: string): string | undefined {
    const match = fileName?.match(/\.([a-z0-9]+)$/i);
    return match?.[1]?.toLowerCase();
}

function getDocumentTypeFromFileType(fileType: string | undefined, fallback: DocumentTypeEnum): DocumentTypeEnum {
    if (!fileType) {
        return fallback;
    }

    if (["xls", "xlsx", "xlsm", "xlsb", "ods", "csv"].includes(fileType)) {
        return "cell";
    }

    if (["ppt", "pptx", "pps", "ppsx", "odp"].includes(fileType)) {
        return "slide";
    }

    if (fileType === "pdf") {
        return "pdf";
    }

    return "word";
}

function createDocumentKey(documentUrl: string, fileType?: string): string {
    const source = `${documentUrl}|${fileType || ""}`;
    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
        hash = (hash * 31 + source.charCodeAt(index)) % 2147483647;
    }

    return `auto-${hash.toString(36)}`;
}

function loadOnlyOfficeApi(documentServerUrl: string): Promise<void> {
    const apiUrl = `${normalizeServerUrl(documentServerUrl)}/web-apps/apps/api/documents/api.js`;
    const existing = loadedScripts.get(apiUrl);

    if (existing) {
        return existing;
    }

    const promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = apiUrl;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Unable to load OnlyOffice API from ${apiUrl}`));
        document.head.appendChild(script);
    });

    loadedScripts.set(apiUrl, promise);
    return promise;
}

export function OnlyOffice(props: OnlyOfficeContainerProps): ReactElement {
    const {
        class: className,
        style,
        documentType,
        mode,
        editorType,
        height,
        canEdit,
        canDownload,
        canPrint,
        canReview,
        canComment,
        onReady,
        onDocumentStateChange,
        onError
    } = props;
    const generatedId = useId();
    const placeholderId = `${props.name}-${generatedId.replace(/:/g, "")}`;
    const editorRef = useRef<DocEditor | undefined>(undefined);
    const [error, setError] = useState<string>();
    const editorHeight = Math.max(Number(height) || 720, 320);

    const documentServerUrl = getValue(props.documentServerUrl);
    const documentUrl = getValue(props.documentUrl);
    const detectedFileName = getFileNameFromUrl(documentUrl);
    const documentTitle = getValue(props.documentTitle) || detectedFileName;
    const fileType =
        getValue(props.fileType)?.replace(/^\./, "").toLowerCase() ||
        getFileTypeFromName(documentTitle) ||
        getFileTypeFromName(detectedFileName);
    const documentKey =
        getValue(props.documentKey) || (documentUrl ? createDocumentKey(documentUrl, fileType) : undefined);
    const resolvedDocumentType = getDocumentTypeFromFileType(fileType, documentType);
    const callbackUrl = getValue(props.callbackUrl);
    const language = getValue(props.language);
    const token = getValue(props.token);
    const userId = getValue(props.userId);
    const userName = getValue(props.userName);

    const missingFields = [
        ["Document server URL", documentServerUrl],
        ["Document URL", documentUrl],
        ["Document title", documentTitle],
        ["File type", fileType]
    ]
        .filter(([, value]) => !value)
        .map(([label]) => label);

    const config = useMemo<OnlyOfficeConfig | undefined>(() => {
        if (!documentUrl || !documentKey || !documentTitle || !fileType) {
            return undefined;
        }

        return {
            type: editorType,
            width: "100%",
            height: `${editorHeight}px`,
            documentType: resolvedDocumentType,
            document: {
                fileType,
                key: documentKey,
                title: documentTitle,
                url: documentUrl,
                permissions: {
                    edit: mode === "edit" && canEdit,
                    download: canDownload,
                    print: canPrint,
                    review: canReview,
                    comment: canComment
                }
            },
            editorConfig: {
                callbackUrl,
                lang: language,
                mode,
                user:
                    userId || userName
                        ? {
                              id: userId,
                              name: userName
                          }
                        : undefined
            },
            token,
            events: {
                onAppReady: () => {
                    if (onReady?.canExecute) {
                        onReady.execute();
                    }
                },
                onDocumentStateChange: () => {
                    if (onDocumentStateChange?.canExecute) {
                        onDocumentStateChange.execute();
                    }
                },
                onError: () => {
                    if (onError?.canExecute) {
                        onError.execute();
                    }
                }
            }
        };
    }, [
        callbackUrl,
        canComment,
        canDownload,
        canEdit,
        canPrint,
        canReview,
        documentKey,
        documentTitle,
        documentUrl,
        editorHeight,
        editorType,
        fileType,
        language,
        mode,
        onDocumentStateChange,
        onError,
        onReady,
        token,
        userId,
        userName,
        resolvedDocumentType
    ]);

    useEffect(() => {
        if (!documentServerUrl || !config) {
            return undefined;
        }

        let isMounted = true;
        setError(undefined);

        loadOnlyOfficeApi(documentServerUrl)
            .then(() => {
                if (!isMounted) {
                    return;
                }

                if (!window.DocsAPI) {
                    throw new Error("OnlyOffice API loaded, but window.DocsAPI is unavailable.");
                }

                editorRef.current?.destroyEditor?.();
                editorRef.current = new window.DocsAPI.DocEditor(placeholderId, config);
            })
            .catch(error => {
                if (isMounted) {
                    setError(error instanceof Error ? error.message : "Unable to initialize OnlyOffice editor.");
                    if (onError?.canExecute) {
                        onError.execute();
                    }
                }
            });

        return () => {
            isMounted = false;
            editorRef.current?.destroyEditor?.();
            editorRef.current = undefined;
        };
    }, [config, documentServerUrl, onError, placeholderId]);

    return (
        <div className={`onlyoffice-widget ${className || ""}`} style={{ ...style, height: `${editorHeight}px` }}>
            {missingFields.length > 0 ? (
                <div className="onlyoffice-widget-message">Configure OnlyOffice: {missingFields.join(", ")}</div>
            ) : error ? (
                <div className="onlyoffice-widget-message onlyoffice-widget-message-error">{error}</div>
            ) : (
                <div id={placeholderId} className="onlyoffice-widget-editor" />
            )}
        </div>
    );
}
