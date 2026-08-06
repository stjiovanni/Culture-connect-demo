"use client";

import { useEffect } from "react";
import { bind } from "cuelume";

export default function Cuelume() {
  useEffect(() => {
    bind();
  }, []);

  return null;
}
