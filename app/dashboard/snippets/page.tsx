"use client";

import { useDashboard } from "@/app/dashboard/DashboardContext";
import SectionSnippets from "@/app/dashboard/sections/SectionSnippets";

export default function SnippetsPage() {
  const {
    filteredSnippets, snippetSearch, setSnippetSearch, members,
    setOpenSnippetModal, setEditingSnippet,
    handleCopySnippet, handleDeleteSnippet,
    setDeleteConfig, setOpenDeleteModal,
  } = useDashboard();

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-1">
      <SectionSnippets
        snippets={filteredSnippets}
        search={snippetSearch}
        setSearch={setSnippetSearch}
        members={members}
        onAddSnippet={() => { setEditingSnippet(null); setOpenSnippetModal(true); }}
        onEditSnippet={s => { setEditingSnippet(s); setOpenSnippetModal(true); }}
        onCopy={handleCopySnippet}
        onDeleteSnippet={s => { setDeleteConfig({ type: "snippet", id: s.id, name: s.title }); setOpenDeleteModal(true); }}
      />
    </div>
  );
}
