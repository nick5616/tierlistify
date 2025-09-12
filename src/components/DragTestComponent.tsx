import React, { useState } from "react";

interface ItemsState {
    area1: string[];
    area2: string[];
    area3: string[];
}
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    PointerSensor,
    TouchSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable,
    closestCenter,
} from "@dnd-kit/core";

// Simple draggable item
function DraggableTestItem({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onMouseDown={() => console.log(`Mouse down on ${id}`)}
            onTouchStart={() => console.log(`Touch start on ${id}`)}
            onPointerDown={() => console.log(`Pointer down on ${id}`)}
            style={{
                width: 50,
                height: 50,
                backgroundColor: isDragging ? "lightblue" : "lightcoral",
                border: "2px solid black",
                margin: 10,
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {id}
        </div>
    );
}

// Simple droppable area
function DroppableTestArea({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                width: 200,
                height: 200,
                backgroundColor: isOver ? "lightgreen" : "lightgray",
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
}

export default function DragTestComponent() {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [sensorType, setSensorType] = useState<string>("all");
    const [items, setItems] = useState<ItemsState>({
        area1: ["item1"],
        area2: ["item2"],
        area3: [],
    });

    // Try different sensor configurations
    const sensors = useSensors(
        ...(sensorType === "all"
            ? [
                  useSensor(PointerSensor),
                  useSensor(MouseSensor),
                  useSensor(TouchSensor),
                  useSensor(KeyboardSensor),
              ]
            : sensorType === "pointer"
            ? [useSensor(PointerSensor)]
            : sensorType === "mouse"
            ? [useSensor(MouseSensor)]
            : sensorType === "touch"
            ? [useSensor(TouchSensor)]
            : [useSensor(KeyboardSensor)])
    );

    function handleDragStart(event: DragStartEvent) {
        console.log("Test drag start:", event);
        setActiveId(event.active.id as string);
    }

    function handleDragEnd(event: DragEndEvent) {
        console.log("Test drag end:", event);
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find current area of item
        let fromArea: string | null = null;
        if (items.area1.indexOf(activeId) !== -1) {
            fromArea = "area1";
        } else if (items.area2.indexOf(activeId) !== -1) {
            fromArea = "area2";
        } else if (items.area3.indexOf(activeId) !== -1) {
            fromArea = "area3";
        }

        if (fromArea && fromArea !== overId) {
            setItems((prev) => {
                const newItems = { ...prev };
                // Remove from old area
                if (fromArea === "area1") {
                    newItems.area1 = newItems.area1.filter(
                        (item: string) => item !== activeId
                    );
                } else if (fromArea === "area2") {
                    newItems.area2 = newItems.area2.filter(
                        (item: string) => item !== activeId
                    );
                } else if (fromArea === "area3") {
                    newItems.area3 = newItems.area3.filter(
                        (item: string) => item !== activeId
                    );
                }

                // Add to new area
                if (overId === "area1") {
                    newItems.area1 = [...newItems.area1, activeId as string];
                } else if (overId === "area2") {
                    newItems.area2 = [...newItems.area2, activeId as string];
                } else if (overId === "area3") {
                    newItems.area3 = [...newItems.area3, activeId as string];
                }

                return newItems;
            });
        }
    }

    function handleDragCancel(event: any) {
        console.log("Test drag cancel:", event);
        setActiveId(null);
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Drag and Drop Test</h1>
            <p>This is a minimal test to see if drag and drop works at all.</p>
            <div style={{ marginBottom: 20, fontSize: 12, color: "gray" }}>
                <p>Browser: {navigator.userAgent}</p>
                <p>
                    Touch support:{" "}
                    {window.navigator.maxTouchPoints > 0 ? "Yes" : "No"}
                </p>
                <p>Pointer events: {"PointerEvent" in window ? "Yes" : "No"}</p>
                <p>
                    <strong>Instructions:</strong> Try clicking and dragging the
                    red boxes to the gray areas. If you see "Pointer down" but
                    no "Test drag start", the sensors aren't activating.
                </p>
                <div style={{ marginBottom: 20 }}>
                    <label>Sensor type: </label>
                    <select
                        value={sensorType}
                        onChange={(e) => setSensorType(e.target.value)}
                        style={{ marginLeft: 10 }}
                    >
                        <option value="all">All sensors</option>
                        <option value="pointer">Pointer only</option>
                        <option value="mouse">Mouse only</option>
                        <option value="touch">Touch only</option>
                        <option value="keyboard">Keyboard only</option>
                    </select>
                    <p style={{ fontSize: 10, color: "gray" }}>
                        Current: {sensorType} - Try different sensor types to
                        see which works
                    </p>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div style={{ display: "flex", gap: 20 }}>
                    <DroppableTestArea id="area1">
                        {items.area1.map((itemId) => (
                            <DraggableTestItem key={itemId} id={itemId} />
                        ))}
                    </DroppableTestArea>

                    <DroppableTestArea id="area2">
                        {items.area2.map((itemId) => (
                            <DraggableTestItem key={itemId} id={itemId} />
                        ))}
                    </DroppableTestArea>

                    <DroppableTestArea id="area3">
                        {items.area3.map((itemId) => (
                            <DraggableTestItem key={itemId} id={itemId} />
                        ))}
                    </DroppableTestArea>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div
                            style={{
                                width: 50,
                                height: 50,
                                backgroundColor: "blue",
                                border: "2px solid white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                            }}
                        >
                            {activeId}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <button
                onClick={() => (window.location.href = "/")}
                style={{ marginTop: 20, padding: 10 }}
            >
                Back to App
            </button>
        </div>
    );
}
