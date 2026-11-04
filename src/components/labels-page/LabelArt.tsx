import type { CSSProperties } from "react";
import { Art } from "@/components/sheet/Art";
import { LABELS, type LabelId } from "./art";

type Props = {
  id: LabelId;
  className?: string;
  style?: CSSProperties;
} & { [data: `data-${string}`]: string | boolean | undefined };

/** One piece of sample label artwork. Decorative: the cell around it says what it shows. */
export function LabelArt({ id, ...rest }: Props) {
  return <Art art={LABELS[id]} {...rest} />;
}
