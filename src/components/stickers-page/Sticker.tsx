import type { CSSProperties } from "react";
import { Art } from "@/components/sheet/Art";
import { ART, type ArtId } from "./art";

type Props = {
  id: ArtId;
  className?: string;
  style?: CSSProperties;
} & { [data: `data-${string}`]: string | boolean | undefined };

/** One piece of sample sticker artwork. Decorative: the cell around it says what it shows. */
export function Sticker({ id, ...rest }: Props) {
  return <Art art={ART[id]} {...rest} />;
}
