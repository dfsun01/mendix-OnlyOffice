import { ReactElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";
import { CharacterCounterPreviewProps } from "../typings/CharacterCounterProps";

export function preview({ sampleText }: CharacterCounterPreviewProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText} />;
}

export function getPreviewCss(): string {
    return require("./ui/CharacterCounter.css");
}
