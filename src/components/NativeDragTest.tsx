import React, { useState } from "react";

export default function NativeDragTest() {
    const [items, setItems] = useState({
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

    const handleDragEnd = (e: React.DragEvent, itemId: string) => {
        console.log("🔴 Drag ended:", itemId);
    };

    const handleDragEnter = (e: React.DragEvent, areaId: string) => {
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
        for (const [areaId, areaItems] of Object.entries(items)) {
            if (areaItems.includes(itemId)) {
                fromArea = areaId;
                break;
            }
        }

        if (fromArea && fromArea !== targetArea) {
            setItems((prev) => {
                const newItems = { ...prev };
                // Remove from old area
                newItems[fromArea as keyof typeof prev] = newItems[
                    fromArea as keyof typeof prev
                ].filter((item) => item !== itemId);
                // Add to new area
                newItems[targetArea as keyof typeof prev] = [
                    ...newItems[targetArea as keyof typeof prev],
                    itemId,
                ];
                return newItems;
            });
            console.log("Item moved successfully!");
        }
    };

    const DraggableItem = ({ id }: { id: string }) => (
        <div
            draggable
            onDragStart={(e) => handleDragStart(e, id)}
            onDrag={(e) => handleDrag(e, id)}
            onDragEnd={(e) => handleDragEnd(e, id)}
            onMouseDown={() => console.log("🔴 Mouse down on", id)}
            onMouseUp={() => console.log("🔴 Mouse up on", id)}
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
            }}
        >
            {id}
        </div>
    );

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
            <p>
                This uses the browser's built-in drag and drop - no external
                libraries!
            </p>

            <div
                style={{
                    marginBottom: 20,
                    fontSize: 12,
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
                    <strong>Instructions:</strong> Click and drag the red boxes.
                    Watch console for colored emoji logs.
                </p>
            </div>

            <div style={{ display: "flex", gap: 20 }}>
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

            <button
                onClick={() => (window.location.href = "/")}
                style={{ marginTop: 20, padding: 10 }}
            >
                Back to App
            </button>
        </div>
    );
}
