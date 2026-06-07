"use client";

import { useDashboard } from "@/app/dashboard/DashboardContext";
import SectionSnippets from "@/app/dashboard/sections/SectionSnippets";

export default function SnippetsPage() {
  const {
    snippets, snippetSearch, setSnippetSearch, members, currentUser,
    setOpenSnippetModal, setEditingSnippet,
    handleCopySnippet, handleDeleteSnippet,
    setDeleteConfig, setOpenDeleteModal,
  } = useDashboard();

  return (
    <div className="h-full overflow-hidden">
      <SectionSnippets
        snippets={snippets}
        search={snippetSearch}
        setSearch={setSnippetSearch}
        members={members}
        currentUser={currentUser}
        onAddSnippet={() => { setEditingSnippet(null); setOpenSnippetModal(true); }}
        onEditSnippet={s => { setEditingSnippet(s); setOpenSnippetModal(true); }}
        onCopy={handleCopySnippet}
        onDeleteSnippet={s => { setDeleteConfig({ type: "snippet", id: s.id, name: s.title }); setOpenDeleteModal(true); }}
      />
    </div>
  );
}
