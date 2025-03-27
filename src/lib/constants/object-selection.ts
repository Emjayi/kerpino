export const OBJECT_TYPES = [
    "bed",
    "desk",
    "chair",
    "sofa",
    "table",
    "dresser",
    "nightstand",
    "bookshelf",
    "wardrobe",
    "cabinet",
    "lamp",
    "rug",
    "mirror",
    "tv_stand",
    "ottoman",
]

export const RESIZE_HANDLES = [
    { position: "top-left", cursor: "nwse-resize" },
    { position: "top", cursor: "ns-resize" },
    { position: "top-right", cursor: "nesw-resize" },
    { position: "right", cursor: "ew-resize" },
    { position: "bottom-right", cursor: "nwse-resize" },
    { position: "bottom", cursor: "ns-resize" },
    { position: "bottom-left", cursor: "nesw-resize" },
    { position: "left", cursor: "ew-resize" },
] as const

