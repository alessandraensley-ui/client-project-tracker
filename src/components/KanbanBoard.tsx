"use client";

import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  BrandBoardColumn,
  BrandBoardCard,
  WebsiteBoardColumn,
  WebsiteBoardCard,
  getUserRole,
} from "@/lib/supabase";
import styles from "../app/page.module.css";

type BoardType = "brand" | "website";

interface ColumnWithCards {
  column: BrandBoardColumn | WebsiteBoardColumn;
  cards: (BrandBoardCard | WebsiteBoardCard)[];
}

interface KanbanBoardProps {
  clientId: string;
  boardType: BoardType;
}

export default function KanbanBoard({ clientId, boardType }: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnWithCards[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<
    BrandBoardCard | WebsiteBoardCard | null
  >(null);
  const [newCardColumn, setNewCardColumn] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDesc, setNewCardDesc] = useState("");
  const [newCardAssignee, setNewCardAssignee] = useState<"Lead" | "Designer">(
    "Lead",
  );
  const [newCardDueDate, setNewCardDueDate] = useState("");
  const userRole = getUserRole();

  const tablePrefix = boardType === "brand" ? "brand_board" : "website_board";
  const columnsTable = `${tablePrefix}_columns`;
  const cardsTable = `${tablePrefix}_cards`;

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch columns
    const { data: cols } = await supabase
      .from(columnsTable)
      .select("*")
      .eq("client_id", clientId)
      .order("position");

    if (!cols) {
      setLoading(false);
      return;
    }

    // Fetch cards
    const { data: cards } = await supabase
      .from(cardsTable)
      .select("*")
      .in(
        "column_id",
        cols.map((c) => c.id),
      )
      .order("position");

    // Combine columns with their cards
    const columnsWithCards: ColumnWithCards[] = cols.map((col) => ({
      column: col,
      cards: cards?.filter((c) => c.column_id === col.id) || [],
    }));

    setColumns(columnsWithCards);
    setLoading(false);
  }, [clientId, columnsTable, cardsTable]);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`${boardType}-kanban`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: columnsTable },
        () => fetchData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: cardsTable },
        () => fetchData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, boardType, columnsTable, cardsTable]);

  const handleAddCard = async (columnId: string) => {
    if (!newCardTitle.trim()) return;

    const { data: maxPos } = await supabase
      .from(cardsTable)
      .select("position")
      .eq("column_id", columnId)
      .order("position", { ascending: false })
      .limit(1);

    const newPosition =
      maxPos && maxPos.length > 0 ? maxPos[0].position + 1 : 0;

    await supabase.from(cardsTable).insert({
      column_id: columnId,
      title: newCardTitle,
      description: newCardDesc,
      assignee: newCardAssignee,
      due_date: newCardDueDate || null,
      position: newPosition,
    });

    setNewCardColumn(null);
    setNewCardTitle("");
    setNewCardDesc("");
    setNewCardAssignee("Lead");
    setNewCardDueDate("");
  };

  const handleUpdateCard = async (card: BrandBoardCard | WebsiteBoardCard) => {
    await supabase
      .from(cardsTable)
      .update({
        title: card.title,
        description: card.description,
        assignee: card.assignee,
        due_date: card.due_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", card.id);

    setEditingCard(null);
  };

  const handleDeleteCard = async (cardId: string) => {
    await supabase.from(cardsTable).delete().eq("id", cardId);
  };

  const handleDragStart = (
    e: React.DragEvent,
    card: BrandBoardCard | WebsiteBoardCard,
  ) => {
    e.dataTransfer.setData("cardId", card.id);
    e.dataTransfer.setData("sourceColumnId", card.column_id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");

    if (sourceColumnId === targetColumnId) return;

    // Get max position in target column
    const { data: maxPos } = await supabase
      .from(cardsTable)
      .select("position")
      .eq("column_id", targetColumnId)
      .order("position", { ascending: false })
      .limit(1);

    const newPosition =
      maxPos && maxPos.length > 0 ? maxPos[0].position + 1 : 0;

    // Update card's column and position
    await supabase
      .from(cardsTable)
      .update({
        column_id: targetColumnId,
        position: newPosition,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardId);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading board...</p>
      </div>
    );
  }

  return (
    <div className={styles.kanbanBoard}>
      {columns.map((col) => (
        <div
          key={col.column.id}
          className={styles.kanbanColumn}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.column.id)}
        >
          <div className={styles.kanbanColumnHeader}>
            <h3>{col.column.column_name}</h3>
            <span className={styles.kanbanCardCount}>{col.cards.length}</span>
          </div>

          <div className={styles.kanbanCards}>
            {col.cards.map((card) => (
              <div
                key={card.id}
                className={styles.kanbanCard}
                draggable
                onDragStart={(e) => handleDragStart(e, card)}
              >
                {editingCard?.id === card.id ? (
                  <div className={styles.kanbanCardEdit}>
                    <input
                      type="text"
                      value={editingCard.title}
                      onChange={(e) =>
                        setEditingCard({
                          ...editingCard,
                          title: e.target.value,
                        })
                      }
                      placeholder="Title"
                    />
                    <textarea
                      value={editingCard.description}
                      onChange={(e) =>
                        setEditingCard({
                          ...editingCard,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description"
                      rows={2}
                    />
                    <div className={styles.kanbanCardFields}>
                      <select
                        value={editingCard.assignee || ""}
                        onChange={(e) =>
                          setEditingCard({
                            ...editingCard,
                            assignee: e.target.value as "Lead" | "Designer",
                          })
                        }
                      >
                        <option value="">Assignee</option>
                        <option value="Lead">Lead</option>
                        <option value="Designer">Designer</option>
                      </select>
                      <input
                        type="date"
                        value={editingCard.due_date || ""}
                        onChange={(e) =>
                          setEditingCard({
                            ...editingCard,
                            due_date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={styles.kanbanCardActions}>
                      <button
                        className={styles.btnPrimary}
                        onClick={() => handleUpdateCard(editingCard)}
                      >
                        Save
                      </button>
                      <button
                        className={styles.btnSecondary}
                        onClick={() => setEditingCard(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.kanbanCardContent}>
                      <h4>{card.title}</h4>
                      {card.description && <p>{card.description}</p>}
                    </div>
                    <div className={styles.kanbanCardMeta}>
                      {card.assignee && (
                        <span
                          className={`${styles.tag} ${
                            card.assignee === "Lead"
                              ? styles.tagLead
                              : styles.tagDesigner
                          }`}
                        >
                          {card.assignee}
                        </span>
                      )}
                      {card.due_date && (
                        <span className={styles.kanbanDueDate}>
                          {new Date(card.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className={styles.kanbanCardActions}>
                      <button
                        className={styles.kanbanEditBtn}
                        onClick={() => setEditingCard(card)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.kanbanDeleteBtn}
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {newCardColumn === col.column.id ? (
            <div className={styles.kanbanAddForm}>
              <input
                type="text"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Card title"
                autoFocus
              />
              <textarea
                value={newCardDesc}
                onChange={(e) => setNewCardDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
              />
              <div className={styles.kanbanCardFields}>
                <select
                  value={newCardAssignee}
                  onChange={(e) =>
                    setNewCardAssignee(e.target.value as "Lead" | "Designer")
                  }
                >
                  <option value="Lead">Lead</option>
                  <option value="Designer">Designer</option>
                </select>
                <input
                  type="date"
                  value={newCardDueDate}
                  onChange={(e) => setNewCardDueDate(e.target.value)}
                />
              </div>
              <div className={styles.kanbanCardActions}>
                <button
                  className={styles.btnPrimary}
                  onClick={() => handleAddCard(col.column.id)}
                >
                  Add
                </button>
                <button
                  className={styles.btnSecondary}
                  onClick={() => {
                    setNewCardColumn(null);
                    setNewCardTitle("");
                    setNewCardDesc("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className={styles.kanbanAddBtn}
              onClick={() => setNewCardColumn(col.column.id)}
            >
              + Add a card
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
