export type PillColor = {
  bg: string;
  fg: string;
};

export type LinkTreeTheme = {
  colors: {
    cream: string;
    ink: string;
    dim: string;
    rose: string;
    brown: string;
    denim: string;
    latte: string;
    border: string;
    scrollTrack: string;
    scrollThumb: string;
    scrollThumbHover: string;
    spiralFront: string;
  };
  pillColors: PillColor[];
};

export const theme: LinkTreeTheme = {
  colors: {
    cream: "#F3ECFC",
    ink: "#463A6B",
    dim: "#9A88C6",
    rose: "#E3D4F7",
    brown: "#7B5FBE",
    denim: "#BBA6E8",
    latte: "#EBE1FA",
    border: "rgba(123,95,190,0.28)",
    scrollTrack: "rgba(235,225,250,0.5)",
    scrollThumb: "linear-gradient(180deg, rgba(123,95,190,0.68), rgba(187,166,232,0.58))",
    scrollThumbHover: "linear-gradient(180deg, rgba(70,58,107,0.78), rgba(187,166,232,0.74))",
    spiralFront: "#A98BE0"
  },
  pillColors: [
    { bg: "#E3D4F7", fg: "#463A6B" },
    { bg: "#7B5FBE", fg: "#F7F3FD" },
    { bg: "#BBA6E8", fg: "#2E2647" },
    { bg: "#EBE1FA", fg: "#463A6B" }
  ]
};
