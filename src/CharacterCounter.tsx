import { ReactElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

import { CharacterCounterContainerProps } from "../typings/CharacterCounterProps";

import "./ui/CharacterCounter.css";

export function CharacterCounter({ sampleText }: CharacterCounterContainerProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText ? sampleText : "World"} />;
}
