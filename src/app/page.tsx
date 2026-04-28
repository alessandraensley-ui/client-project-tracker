"use client";

import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  Client,
  Task,
  Note,
  Presence,
  getUserId,
  getUserRole,
  getUserName,
  setUserRole,
} from "@/lib/supabase";
import KanbanBoard from "@/components/KanbanBoard";
import styles from "./page.module.css";

// Icons as simple SVG components
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8L6.5 11.5L13 4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="3"
      width="12"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M2 5L8 9L14 5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 2.5L5 4.5C5.5 5 6 5.5 6 6V10C6 10.5 5.5 11 5 11.5L3 13.5C2.5 14 2 14 1.5 13.5C1 13 1 12.5 1.5 12L2.5 11C2.5 11 3 10 3.5 9.5L4.5 8.5C5 8 6 8 6.5 8.5L7.5 9.5C8 10 8 11 7.5 11.5L6 13C5.5 13.5 5.5 14 6 14C6.5 14 7 14 7.5 13.5L10 11C10.5 10.5 11 10 11 9.5L11.5 8.5C12 8 13 7.5 13.5 7C14 6.5 14 6 13.5 5.5L11.5 3.5C11 3 10.5 2.5 10 2.5C9.5 2 9 2 8.5 2.5L7 4C6.5 4.5 6 4.5 5.5 4L3 2.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="3"
      width="12"
      height="11"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M5 1V4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M11 1V4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M2 14V6C2 5.5 2.5 5 3 5H13C13.5 5 14 5.5 14 6V14"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M2 9H14" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 14V11" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 14V11" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 14V11" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M6 5V3C6 2.5 6.5 2 7 2H9C9.5 2 10 2.5 10 3V5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 8H14" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M8 2C9.5 3 10.5 4.5 10.5 6C10.5 7.5 9.5 9 8 10C6.5 11 5.5 12.5 5.5 14"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M8 2C6.5 3 5.5 4.5 5.5 6C5.5 7.5 6.5 9 8 10C9.5 11 10.5 12.5 10.5 14"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M14 2L7 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 2L9 14L7 9L2 7L14 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M2 14C2 11.5 4.5 10 8 10C11.5 10 14 11.5 14 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const DotIcon = ({ color }: { color: string }) => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <circle cx="4" cy="4" r="4" fill={color} />
  </svg>
);

export default function Dashboard() {
  const [client, setClient] = useState<Client | null>(null);
  const [brandTasks, setBrandTasks] = useState<Task[]>([]);
  const [websiteTasks, setWebsiteTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [noteRole, setNoteRole] = useState<"Lead" | "Designer">("Lead");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "brand" | "website">(
    "overview",
  );

  const userId = getUserId();
  const userRole = getUserRole();
  const userName = getUserName();

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch client
        const { data: clientData } = await supabase
          .from("clients")
          .select("*")
          .limit(1)
          .single();

        if (clientData) {
          setClient(clientData);

          // Fetch tasks
          const [brandResult, websiteResult, notesResult] = await Promise.all([
            supabase
              .from("brand_tasks")
              .select("*")
              .eq("client_id", clientData.id)
              .order("day"),
            supabase
              .from("website_tasks")
              .select("*")
              .eq("client_id", clientData.id)
              .order("day"),
            supabase
              .from("notes")
              .select("*")
              .eq("client_id", clientData.id)
              .order("created_at", { ascending: false }),
          ]);

          if (brandResult.data) setBrandTasks(brandResult.data);
          if (websiteResult.data) setWebsiteTasks(websiteResult.data);
          if (notesResult.data) setNotes(notesResult.data);
        }

        setConnected(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    const clientId = client?.id;

    if (!clientId) return;

    const channel = supabase
      .channel("dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clients" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setClient((prev) => (prev ? { ...prev, ...payload.new } : null));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brand_tasks" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setBrandTasks((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? (payload.new as Task) : t,
              ),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "website_tasks" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setWebsiteTasks((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? (payload.new as Task) : t,
              ),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotes((prev) => [payload.new as Note, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [client?.id]);

  // Presence tracking
  useEffect(() => {
    async function updatePresence() {
      await supabase.from("presence").upsert(
        {
          user_id: userId,
          user_name: userName,
          user_role: userRole,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    }

    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    // Subscribe to presence changes
    const presenceChannel = supabase
      .channel("presence")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "presence" },
        async () => {
          const { data } = await supabase
            .from("presence")
            .select("*")
            .order("last_seen", { ascending: false });

          if (data) setPresence(data);
        },
      )
      .subscribe();

    // Initial presence fetch
    supabase
      .from("presence")
      .select("*")
      .order("last_seen", { ascending: false })
      .then(({ data }) => {
        if (data) setPresence(data);
      });

    return () => {
      clearInterval(interval);
      supabase.removeChannel(presenceChannel);
    };
  }, [userId, userName, userRole]);

  // Update client field
  const updateClientField = async (field: string, value: string) => {
    if (!client) return;

    setClient((prev) => (prev ? { ...prev, [field]: value } : null));
    setEditingField(null);

    await supabase
      .from("clients")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", client.id);
  };

  // Toggle task completion
  const toggleTask = async (
    task: Task,
    table: "brand_tasks" | "website_tasks",
  ) => {
    const newCompleted = !task.completed;

    // Optimistic update
    if (table === "brand_tasks") {
      setBrandTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                completed: newCompleted,
                completed_by: newCompleted ? userName : null,
                completed_at: newCompleted ? new Date().toISOString() : null,
              }
            : t,
        ),
      );
    } else {
      setWebsiteTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                completed: newCompleted,
                completed_by: newCompleted ? userName : null,
                completed_at: newCompleted ? new Date().toISOString() : null,
              }
            : t,
        ),
      );
    }

    await supabase
      .from(table)
      .update({
        completed: newCompleted,
        completed_by: newCompleted ? userName : null,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq("id", task.id);
  };

  // Add note
  const addNote = async () => {
    if (!newNote.trim() || !client) return;

    const note = {
      client_id: client.id,
      user_name: userName,
      user_role: noteRole,
      content: newNote.trim(),
    };

    setNewNote("");

    const { error } = await supabase.from("notes").insert(note);

    if (error) {
      console.error("Error adding note:", error);
    }
  };

  // Calculate progress
  const calculateProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  // Group tasks by group_name
  const groupTasks = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {};
    tasks.forEach((task) => {
      if (!groups[task.group_name]) {
        groups[task.group_name] = [];
      }
      groups[task.group_name].push(task);
    });
    return groups;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading project...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>
            <img src="/ALESSANDRA ENSLEY (3).png" alt="Alessandra Ensley" />
            <span className={styles.logoText}>
              Alessandra Ensley — Creative Studio
            </span>
          </h1>
          <div className={styles.connectionStatus}>
            <DotIcon color={connected ? "#4ADE80" : "#EF4444"} />
            <span>{connected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.presence}>
            {presence.slice(0, 5).map((p) => (
              <div
                key={p.user_id}
                className={styles.presenceAvatar}
                title={`${p.user_name} (${p.user_role})`}
              >
                <span>{p.user_name.charAt(0).toUpperCase()}</span>
                <div className={styles.presenceDot}></div>
              </div>
            ))}
          </div>

          <div className={styles.roleSelector}>
            <button
              className={`${styles.roleBtn} ${userRole === "Lead" ? styles.active : ""}`}
              onClick={() => setUserRole("Lead")}
            >
              Lead
            </button>
            <button
              className={`${styles.roleBtn} ${userRole === "Designer" ? styles.active : ""}`}
              onClick={() => setUserRole("Designer")}
            >
              Designer
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "brand" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("brand")}
        >
          Brand Board
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "website" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("website")}
        >
          Website Board
        </button>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        {activeTab === "overview" && (
          <>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Client Info */}
          <section
            className={`card ${styles.section} animate-fade-in stagger-1`}
          >
            <h2 className={styles.sectionTitle}>
              <UserIcon />
              Client Information
            </h2>

            <div className={styles.clientGrid}>
              <div className={styles.field}>
                <label>Client Name</label>
                {editingField === "client_name" ? (
                  <input
                    autoFocus
                    value={client?.client_name || ""}
                    onChange={(e) =>
                      setClient((prev) =>
                        prev ? { ...prev, client_name: e.target.value } : null,
                      )
                    }
                    onBlur={() =>
                      updateClientField(
                        "client_name",
                        client?.client_name || "",
                      )
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      updateClientField(
                        "client_name",
                        client?.client_name || "",
                      )
                    }
                  />
                ) : (
                  <div
                    className={styles.fieldValue}
                    onClick={() => setEditingField("client_name")}
                  >
                    {client?.client_name}
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label>Brand Name</label>
                {editingField === "brand_name" ? (
                  <input
                    autoFocus
                    value={client?.brand_name || ""}
                    onChange={(e) =>
                      setClient((prev) =>
                        prev ? { ...prev, brand_name: e.target.value } : null,
                      )
                    }
                    onBlur={() =>
                      updateClientField("brand_name", client?.brand_name || "")
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      updateClientField("brand_name", client?.brand_name || "")
                    }
                  />
                ) : (
                  <div
                    className={styles.fieldValue}
                    onClick={() => setEditingField("brand_name")}
                  >
                    {client?.brand_name}
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label>Email</label>
                <div className={styles.fieldWithIcon}>
                  <MailIcon />
                  {editingField === "email" ? (
                    <input
                      autoFocus
                      value={client?.email || ""}
                      onChange={(e) =>
                        setClient((prev) =>
                          prev ? { ...prev, email: e.target.value } : null,
                        )
                      }
                      onBlur={() =>
                        updateClientField("email", client?.email || "")
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        updateClientField("email", client?.email || "")
                      }
                    />
                  ) : (
                    <a
                      href={`mailto:${client?.email}`}
                      className={styles.fieldValue}
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingField("email");
                      }}
                    >
                      {client?.email || "Add email"}
                    </a>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label>Phone</label>
                <div className={styles.fieldWithIcon}>
                  <PhoneIcon />
                  {editingField === "phone" ? (
                    <input
                      autoFocus
                      value={client?.phone || ""}
                      onChange={(e) =>
                        setClient((prev) =>
                          prev ? { ...prev, phone: e.target.value } : null,
                        )
                      }
                      onBlur={() =>
                        updateClientField("phone", client?.phone || "")
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        updateClientField("phone", client?.phone || "")
                      }
                    />
                  ) : (
                    <a
                      href={`tel:${client?.phone}`}
                      className={styles.fieldValue}
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingField("phone");
                      }}
                    >
                      {client?.phone || "Add phone"}
                    </a>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label>Industry</label>
                {editingField === "industry" ? (
                  <select
                    autoFocus
                    value={client?.industry || ""}
                    onChange={(e) =>
                      updateClientField("industry", e.target.value)
                    }
                    onBlur={() => setEditingField(null)}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div
                    className={styles.fieldValue}
                    onClick={() => setEditingField("industry")}
                  >
                    {client?.industry}
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label>Start Date</label>
                <div className={styles.fieldWithIcon}>
                  <CalendarIcon />
                  {editingField === "start_date" ? (
                    <input
                      autoFocus
                      type="date"
                      value={client?.start_date || ""}
                      onChange={(e) =>
                        updateClientField("start_date", e.target.value)
                      }
                      onBlur={() => setEditingField(null)}
                    />
                  ) : (
                    <div
                      className={styles.fieldValue}
                      onClick={() => setEditingField("start_date")}
                    >
                      {client?.start_date
                        ? formatDate(client.start_date)
                        : "Set date"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Brand Development */}
          <section
            className={`card ${styles.section} animate-fade-in stagger-2`}
          >
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <BuildingIcon />
                Brand Development
              </h2>
              <span className={styles.timeline}>10-Day Timeline</span>
            </div>

            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${calculateProgress(brandTasks)}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>
                {calculateProgress(brandTasks)}%
              </span>
            </div>

            <div className={styles.taskGroups}>
              {Object.entries(groupTasks(brandTasks)).map(
                ([groupName, tasks]) => (
                  <div key={groupName} className={styles.taskGroup}>
                    <h4 className={styles.groupName}>{groupName}</h4>
                    <div className={styles.taskList}>
                      {tasks.map((task) => (
                        <label
                          key={task.id}
                          className={`${styles.taskItem} ${task.completed ? styles.completed : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task, "brand_tasks")}
                          />
                          <span className={styles.checkbox}>
                            {task.completed && <CheckIcon />}
                          </span>
                          <span className={styles.taskName}>
                            {task.task_name}
                          </span>
                          <span className={styles.taskDay}>Day {task.day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* Website Development */}
          <section
            className={`card ${styles.section} animate-fade-in stagger-3`}
          >
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <GlobeIcon />
                Website Development
              </h2>
              <span className={styles.timeline}>14-Day Timeline</span>
            </div>

            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${calculateProgress(websiteTasks)}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>
                {calculateProgress(websiteTasks)}%
              </span>
            </div>

            <div className={styles.taskGroups}>
              {Object.entries(groupTasks(websiteTasks)).map(
                ([groupName, tasks]) => (
                  <div key={groupName} className={styles.taskGroup}>
                    <h4 className={styles.groupName}>{groupName}</h4>
                    <div className={styles.taskList}>
                      {tasks.map((task) => (
                        <label
                          key={task.id}
                          className={`${styles.taskItem} ${task.completed ? styles.completed : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task, "website_tasks")}
                          />
                          <span className={styles.checkbox}>
                            {task.completed && <CheckIcon />}
                          </span>
                          <span className={styles.taskName}>
                            {task.task_name}
                          </span>
                          <span className={styles.taskDay}>Day {task.day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Notes Feed */}
        <div
          className={`card ${styles.notesSection} animate-fade-in stagger-4`}
        >
          <h2 className={styles.sectionTitle}>
            <SendIcon />
            Project Notes
          </h2>

          <div className={styles.notesInput}>
            <div className={styles.noteRoleSelector}>
              <button
                className={`${styles.noteRoleBtn} ${noteRole === "Lead" ? styles.leadActive : ""}`}
                onClick={() => setNoteRole("Lead")}
              >
                Lead
              </button>
              <button
                className={`${styles.noteRoleBtn} ${noteRole === "Designer" ? styles.designerActive : ""}`}
                onClick={() => setNoteRole("Designer")}
              >
                Designer
              </button>
            </div>
            <div className={styles.noteInputRow}>
              <input
                type="text"
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
              />
              <button className="btn btn-primary" onClick={addNote}>
                <SendIcon />
              </button>
            </div>
          </div>

          <div className={styles.notesFeed}>
            {notes.length === 0 ? (
              <p className={styles.noNotes}>
                No notes yet. Start the conversation!
              </p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className={styles.noteCard}>
                  <div className={styles.noteHeader}>
                    <div className={styles.noteAvatar}>
                      {note.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.noteMeta}>
                      <span className={styles.noteName}>{note.user_name}</span>
                      <span
                        className={`tag ${note.user_role === "Lead" ? "tag-lead" : "tag-designer"}`}
                      >
                        {note.user_role}
                      </span>
                    </div>
                    <span className={styles.noteTime}>
                      {formatTime(note.created_at)}
                    </span>
                  </div>
                  <p className={styles.noteContent}>{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
          </>
        )}

        {activeTab === "brand" && client && (
          <div className={styles.kanbanContainer}>
            <KanbanBoard clientId={client.id} boardType="brand" />
          </div>
        )}

        {activeTab === "website" && client && (
          <div className={styles.kanbanContainer}>
            <KanbanBoard clientId={client.id} boardType="website" />
          </div>
        )}
      </main>
    </div>
  );
}
