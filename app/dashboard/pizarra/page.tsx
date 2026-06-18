"use client";

import { useDashboard } from "@/app/dashboard/DashboardContext";
import SectionPizarra from "@/app/dashboard/sections/SectionPizarra";

export default function PizarraPage() {
  const {
    notes, drawings, boardImages, boardShapes, customShapes, members,
    setOpenNoteModal,
    handleDeleteNote, handleDragNote, handleDragImage,
    saveDrawings, saveImages, saveNotes, saveShapes, saveCustomShapes,
    pushToHistory, undo, redo, clipboard, setClipboard,
    setDeleteConfig, setOpenDeleteModal,
  } = useDashboard();

  return (
    <SectionPizarra
      notes={notes}
      drawings={drawings}
      images={boardImages}
      shapes={boardShapes}
      customShapes={customShapes}
      members={members}
      onAddNote={() => setOpenNoteModal(true)}
      onDeleteNote={n => { setDeleteConfig({ type: "note", id: n.id, name: "esta nota" }); setOpenDeleteModal(true); }}
      onDeleteImage={img => { saveImages(boardImages.filter(i => i.id !== img.id)); }}
      onSaveDrawings={saveDrawings}
      onSaveImages={saveImages}
      onSaveNotes={saveNotes}
      onSaveShapes={saveShapes}
      onSaveCustomShapes={saveCustomShapes}
      onDragNote={handleDragNote}
      onDragImage={handleDragImage}
      pushToHistory={pushToHistory}
      undo={undo}
      redo={redo}
      clipboard={clipboard}
      setClipboard={setClipboard}
      onClearAll={() => {
        pushToHistory();
        saveDrawings([]); saveNotes([]); saveImages([]); saveShapes([]);
      }}
    />
  );
}
