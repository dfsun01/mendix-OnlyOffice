import { ReactElement } from "react";
import { OnlyOfficePreviewProps } from "../typings/OnlyOfficeProps";

import "./ui/OnlyOffice.css";

export function preview(_props: OnlyOfficePreviewProps): ReactElement {
    return (
        <div className="onlyoffice-widget onlyoffice-widget-preview">
            <div className="onlyoffice-widget-preview-toolbar">
                <span />
                <span />
                <span />
            </div>
            <div className="onlyoffice-widget-preview-title">OnlyOffice</div>
            <div className="onlyoffice-widget-preview-page" />
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/OnlyOffice.css");
}
