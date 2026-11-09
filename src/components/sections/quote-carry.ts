"use client";

/*
 * The artwork someone uploaded on the homepage, carried to the quote page when they press
 * "Continue to checkout" (an in-app navigation keeps this module alive; their choices
 * travel in the URL). After a full reload it is gone and they choose the file again.
 */

let carried: File | null = null;

export const carryFile = (file: File | null) => {
  carried = file;
};

/** The carried file, once. */
export const takeCarriedFile = () => {
  const file = carried;
  carried = null;
  return file;
};
