import React, { useState, useRef, useEffect } from "react";

interface ItemsState {
    area1: string[];
    area2: string[];
    area3: string[];
}

export default function NativeDragTest() {
    console.log("🚀 NativeDragTest component loaded");
    console.log("🚀 Console is working!");

    const [items, setItems] = useState<ItemsState>({
        area1: ["item1"],
        area2: ["item2"],
        area3: [],
    });

    const handleDragStart = (e: React.DragEvent, itemId: string) => {
        console.log("🟢 Native drag start:", itemId);
        console.log("🟢 Event type:", e.type);
        console.log("🟢 DataTransfer available:", !!e.dataTransfer);
        e.dataTransfer.setData("text/plain", itemId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrag = (e: React.DragEvent, itemId: string) => {
        console.log("🔵 Dragging:", itemId, "at", e.clientX, e.clientY);
    };

    const handleDragEnd = (_e: React.DragEvent, itemId: string) => {
        console.log("🔴 Drag ended:", itemId);
    };

    const handleDragEnter = (_e: React.DragEvent, areaId: string) => {
        console.log("🟡 Drag enter:", areaId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        console.log("🟠 Drag over");
        e.preventDefault(); // Allow drop
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetArea: string) => {
        console.log("🟣 Drop event fired on:", targetArea);
        e.preventDefault();
        const itemId = e.dataTransfer.getData("text/plain");
        console.log("🟣 Dropped item:", itemId, "to", targetArea);

        // Find current area
        let fromArea = "";
        if (items.area1.indexOf(itemId) !== -1) {
            fromArea = "area1";
        } else if (items.area2.indexOf(itemId) !== -1) {
            fromArea = "area2";
        } else if (items.area3.indexOf(itemId) !== -1) {
            fromArea = "area3";
        }

        if (fromArea && fromArea !== targetArea) {
            setItems((prev) => {
                const newItems = { ...prev };
                // Remove from old area
                if (fromArea === "area1") {
                    newItems.area1 = newItems.area1.filter(
                        (item: string) => item !== itemId
                    );
                } else if (fromArea === "area2") {
                    newItems.area2 = newItems.area2.filter(
                        (item: string) => item !== itemId
                    );
                } else if (fromArea === "area3") {
                    newItems.area3 = newItems.area3.filter(
                        (item: string) => item !== itemId
                    );
                }

                // Add to new area
                if (targetArea === "area1") {
                    newItems.area1 = [...newItems.area1, itemId as string];
                } else if (targetArea === "area2") {
                    newItems.area2 = [...newItems.area2, itemId as string];
                } else if (targetArea === "area3") {
                    newItems.area3 = [...newItems.area3, itemId as string];
                }

                return newItems;
            });
            console.log("Item moved successfully!");
        }
    };

    const DraggableItem = ({ id }: { id: string }) => {
        console.log("🟨 Rendering DraggableItem:", id);
        const ref = useRef<HTMLDivElement>(null);
        const dragState = useRef({
            isDragging: false,
            startX: 0,
            startY: 0,
            hasMoved: false,
        });

        useEffect(() => {
            const element = ref.current;
            if (!element) return;

            console.log("🔧 Manually attaching drag listeners to", id);

            const onDragStart = (e: DragEvent) => {
                console.log("🟢 MANUAL onDragStart triggered for", id);
                handleDragStart(e as any, id);
            };

            const onDrag = (e: DragEvent) => {
                handleDrag(e as any, id);
            };

            const onDragEnd = (e: DragEvent) => {
                console.log("🔴 MANUAL onDragEnd triggered for", id);
                handleDragEnd(e as any, id);
            };

            // Manually attach native event listeners
            element.addEventListener("dragstart", onDragStart);
            element.addEventListener("drag", onDrag);
            element.addEventListener("dragend", onDragEnd);

            // Check if they're attached
            console.log("🔧 Event listeners attached. Checking...");
            setTimeout(() => {
                console.log(
                    "🔧 DOM element ondragstart:",
                    !!element.ondragstart
                );
                console.log("🔧 Element draggable:", element.draggable);
                console.log("🔧 Element tagName:", element.tagName);

                // Try to get all event listeners (Chrome only)
                if ("getEventListeners" in window) {
                    console.log(
                        "🔧 All event listeners:",
                        (window as any).getEventListeners(element)
                    );
                }

                // Test if drag events are supported at all
                console.log(
                    "🔧 Browser drag support:",
                    "ondragstart" in element
                );

                // Try attaching a different way
                element.ondragstart = (e) => {
                    console.log(
                        "🟢 PROPERTY-BASED onDragStart triggered for",
                        id
                    );
                    handleDragStart(e as any, id);
                };

                console.log(
                    "🔧 After property assignment ondragstart:",
                    !!element.ondragstart
                );
            }, 100);

            return () => {
                element.removeEventListener("dragstart", onDragStart);
                element.removeEventListener("drag", onDrag);
                element.removeEventListener("dragend", onDragEnd);
            };
        }, [id]);

        return (
            <div
                ref={ref}
                data-testid={id}
                draggable={true}
                onMouseDown={(e) => {
                    console.log(
                        "🔴 Mouse down on",
                        id,
                        "button:",
                        e.button,
                        "buttons:",
                        e.buttons
                    );

                    if (e.button === 0) {
                        // Left mouse button
                        dragState.current = {
                            isDragging: true,
                            startX: e.clientX,
                            startY: e.clientY,
                            hasMoved: false,
                        };
                        console.log("🟡 Drag state initialized for", id);
                    }
                }}
                onMouseUp={(e) => {
                    console.log("🔴 Mouse up on", id, "button:", e.button);

                    if (dragState.current.isDragging) {
                        if (dragState.current.hasMoved) {
                            console.log("🔴 MANUAL Drag ended for", id);
                            handleDragEnd(e as any, id);
                        }
                        dragState.current.isDragging = false;
                        dragState.current.hasMoved = false;
                    }
                }}
                onMouseMove={(e) => {
                    if (dragState.current.isDragging && e.buttons === 1) {
                        const deltaX = Math.abs(
                            e.clientX - dragState.current.startX
                        );
                        const deltaY = Math.abs(
                            e.clientY - dragState.current.startY
                        );
                        const distance = Math.sqrt(
                            deltaX * deltaX + deltaY * deltaY
                        );

                        if (!dragState.current.hasMoved && distance > 5) {
                            // Start drag after moving 5 pixels
                            console.log(
                                "🟢 MANUAL Drag started for",
                                id,
                                "distance:",
                                distance
                            );
                            dragState.current.hasMoved = true;

                            // Manually trigger drag start
                            const dragEvent = new DragEvent("dragstart", {
                                bubbles: true,
                                cancelable: true,
                                view: window,
                                dataTransfer: new DataTransfer(),
                            });
                            e.currentTarget.dispatchEvent(dragEvent);
                        }

                        if (dragState.current.hasMoved) {
                            console.log(
                                "🔵 MANUAL Dragging",
                                id,
                                "at",
                                e.clientX,
                                e.clientY
                            );
                        }
                    }
                }}
                onMouseLeave={() => {
                    // Handle case where mouse leaves element while dragging
                    if (
                        dragState.current.isDragging &&
                        dragState.current.hasMoved
                    ) {
                        console.log("🟠 Mouse left element while dragging", id);
                    }
                }}
                onClick={(e) => {
                    // Only log click if we didn't drag
                    if (!dragState.current.hasMoved) {
                        console.log("🟡 Click on", id, "button:", e.button);
                    }
                }}
                style={{
                    width: 50,
                    height: 50,
                    backgroundColor: "lightcoral",
                    border: "2px solid black",
                    margin: 10,
                    cursor: "grab",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                    // Removed touchAction: "none" as it might interfere
                }}
            >
                {id}
            </div>
        );
    };

    const DroppableArea = ({
        id,
        children,
    }: {
        id: string;
        children: React.ReactNode;
    }) => (
        <div
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, id)}
            onDrop={(e) => handleDrop(e, id)}
            style={{
                width: 200,
                height: 200,
                backgroundColor: "lightgray",
                border: "2px dashed black",
                margin: 20,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <h3>{id}</h3>
            {children}
        </div>
    );

    return (
        <div style={{ padding: 20 }}>
            <h1>Native HTML5 Drag & Drop Test</h1>
            <p style={{ fontSize: 18, color: "blue", fontWeight: "bold" }}>
                🎯 DRAG THE RED BOXES BELOW - WATCH CONSOLE FOR LOGS!
            </p>
            <p>
                This uses the browser's built-in drag and drop - no external
                libraries!
            </p>

            <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
                <DroppableArea id="area1">
                    {items.area1.map((itemId) => (
                        <DraggableItem key={itemId} id={itemId} />
                    ))}
                </DroppableArea>

                <DroppableArea id="area2">
                    {items.area2.map((itemId) => (
                        <DraggableItem key={itemId} id={itemId} />
                    ))}
                </DroppableArea>

                <DroppableArea id="area3">
                    {items.area3.map((itemId) => (
                        <DraggableItem key={itemId} id={itemId} />
                    ))}
                </DroppableArea>
            </div>

            <div style={{ marginBottom: 20 }}>
                <button
                    onClick={() => console.log("✅ Button click works!")}
                    style={{
                        marginRight: 10,
                        padding: 10,
                        backgroundColor: "lightgreen",
                    }}
                >
                    Test Click
                </button>
                <button
                    onClick={() => {
                        const item1 = document.querySelector(
                            '[data-testid="item1"]'
                        ) as HTMLElement;
                        if (item1) {
                            console.log("🔍 Found item1 element:", item1);
                            console.log("🔍 item1.draggable:", item1.draggable);
                            console.log("🔍 item1 events:", {
                                ondragstart: !!item1.ondragstart,
                                ondrag: !!item1.ondrag,
                                ondragend: !!item1.ondragend,
                            });

                            // Try to manually trigger a drag event
                            const dragEvent = new DragEvent("dragstart", {
                                bubbles: true,
                                cancelable: true,
                                dataTransfer: new DataTransfer(),
                            });
                            console.log(
                                "🔍 Manually dispatching dragstart event..."
                            );
                            item1.dispatchEvent(dragEvent);
                        } else {
                            console.log("🔍 Could not find item1 element");
                        }
                    }}
                    style={{
                        marginRight: 10,
                        padding: 10,
                        backgroundColor: "orange",
                    }}
                >
                    Debug item1
                </button>
                <button
                    onClick={() => (window.location.href = "/")}
                    style={{ padding: 10 }}
                >
                    Back to App
                </button>
            </div>

            {/* Debug info moved to bottom */}
            <details style={{ marginTop: 30, fontSize: 12 }}>
                <summary>🔍 Browser Debug Info (click to expand)</summary>
                <div
                    style={{
                        marginTop: 10,
                        color: "gray",
                        backgroundColor: "#f5f5f5",
                        padding: 10,
                    }}
                >
                    <p>
                        <strong>Browser:</strong> {navigator.userAgent}
                    </p>
                    <p>
                        <strong>Platform:</strong> {navigator.platform}
                    </p>
                    <p>
                        <strong>Touch support:</strong>{" "}
                        {navigator.maxTouchPoints > 0 ? "Yes" : "No"}
                    </p>
                    <p>
                        <strong>Drag and drop API:</strong>{" "}
                        {"ondragstart" in document.createElement("div")
                            ? "Supported"
                            : "Not supported"}
                    </p>
                    <p>
                        <strong>Pointer Events:</strong>{" "}
                        {"onpointerdown" in document.createElement("div")
                            ? "Supported"
                            : "Not supported"}
                    </p>
                    <p>
                        <strong>Window zoom:</strong>{" "}
                        {(
                            (window.outerWidth / window.innerWidth) *
                            100
                        ).toFixed(1)}
                        %
                    </p>
                    <p>
                        <strong>Device pixel ratio:</strong>{" "}
                        {window.devicePixelRatio}
                    </p>
                </div>
            </details>
        </div>
    );
}
