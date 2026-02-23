"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

type Role = "Admin" | "Developer" | "Auditor";
type RoleFilter = "All" | Role;

interface Permission {
    id: string;
    label: string;
    icon: string;
}

interface TeamMember {
    id: string;
    initials: string;
    name: string;
    email: string;
    role: Role;
    avatarColor: string;
    permissions: Record<string, boolean>;
}

const PERMISSIONS: Permission[] = [
    { id: "refunds", label: "Can Issue Refunds", icon: "payments" },
    { id: "apiKeys", label: "View API Keys", icon: "vpn_key" },
];

const ROLE_CONFIG: Record<Role, { badge: string; text: string; canEdit: boolean }> = {
    Admin: { badge: "bg-primary/20 text-primary border border-primary/30", text: "Admin", canEdit: true },
    Developer: { badge: "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700", text: "Developer", canEdit: true },
    Auditor: { badge: "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700", text: "Auditor", canEdit: false },
};



const ROLES_FOR_SHEET: { role: Role; icon: string; description: string }[] = [
    { role: "Admin", icon: "admin_panel_settings", description: "Full control over switching and users" },
    { role: "Developer", icon: "code", description: "API access and technical config" },
    { role: "Auditor", icon: "fact_check", description: "Read-only access to reports and logs" },
];

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
    const [sheet, setSheet] = useState<string | null>(null); // member id
    const [loading, setLoading] = useState(true);

    const loadMembers = async () => {
        try {
            const data = await fetch("/api/team").then(res => res.json());
            if (data.members) setMembers(data.members);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadMembers(); }, []);

    const filters: RoleFilter[] = ["All", "Admin", "Developer", "Auditor"];

    const filtered = members.filter((m) => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "All" || m.role === roleFilter;
        return matchSearch && matchRole;
    });

    const togglePermission = async (memberId: string, permId: string) => {
        const member = members.find(m => m.id === memberId);
        if (!member || !ROLE_CONFIG[member.role].canEdit) return;

        const newPerms = { ...member.permissions, [permId]: !member.permissions[permId] };
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions: newPerms } : m));

        await fetch("/api/team", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: memberId, role: member.role, permissions: newPerms })
        });
    };

    const setRole = async (memberId: string, role: Role) => {
        const member = members.find(m => m.id === memberId);
        if (!member) return;

        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
        setSheet(null);

        await fetch("/api/team", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: memberId, role, permissions: member.permissions })
        });
    };

    const sheetMember = members.find((m) => m.id === sheet);

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 mb-4 md:-mx-0 -mx-4 px-4 pt-4 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">shield_person</span>
                        <h1 className="text-xl font-bold tracking-tight">Team</h1>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors shadow-sm shadow-primary/20">
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Invite
                    </button>
                </div>
                {/* Search */}
                <div className="relative mb-3">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500"
                        placeholder="Search members..."
                    />
                </div>
                {/* Filter Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl overflow-x-auto hide-scrollbar gap-1">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setRoleFilter(f)}
                            className={clsx(
                                "flex-1 py-1.5 px-3 text-xs font-medium rounded-lg whitespace-nowrap transition-all",
                                roleFilter === f
                                    ? "bg-white dark:bg-slate-800 shadow-sm text-primary"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Member List */}
            <main className="flex-1 pb-24 md:pb-8 space-y-4 px-4 md:px-0">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                    Team Members ({filtered.length})
                </h2>
                {loading && (
                    <div className="text-center py-12 text-slate-400">Loading members...</div>
                )}
                {!loading && filtered.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mb-2">group_off</span>
                        <p className="font-semibold">No members found</p>
                    </div>
                )}
                {!loading && filtered.map((member) => {
                    const config = ROLE_CONFIG[member.role];
                    const canEdit = config.canEdit;
                    return (
                        <div
                            key={member.id}
                            className={clsx(
                                "bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-opacity",
                                !canEdit && "opacity-80"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={clsx("size-10 rounded-full flex items-center justify-center font-bold text-sm", member.avatarColor)}>
                                        {member.initials}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{member.name}</p>
                                        <p className="text-xs text-slate-500">{member.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => canEdit && setSheet(member.id)}
                                    className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase", config.badge, canEdit && "cursor-pointer hover:opacity-80")}
                                >
                                    {config.text}
                                </button>
                            </div>
                            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                {PERMISSIONS.map((p) => (
                                    <div key={p.id} className={clsx("flex items-center justify-between", !canEdit && "opacity-60")}>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400 text-sm">{p.icon}</span>
                                            <span className="text-xs font-medium">{p.label}</span>
                                        </div>
                                        <button
                                            disabled={!canEdit}
                                            onClick={() => togglePermission(member.id, p.id)}
                                            className={clsx(
                                                "relative h-5 w-9 rounded-full transition-colors duration-200",
                                                member.permissions[p.id] ? "bg-primary" : "bg-slate-200 dark:bg-slate-700",
                                                !canEdit && "cursor-not-allowed"
                                            )}
                                        >
                                            <div className={clsx(
                                                "absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                                                member.permissions[p.id] ? "translate-x-[18px] left-0" : "translate-x-0 left-[2px]"
                                            )} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* Role Assignment Bottom Sheet */}
            {sheet && sheetMember && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSheet(null)} />
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-2xl pb-safe animate-slide-in-up">
                        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3" />
                        <div className="px-6 pb-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Manage Role</h3>
                                <button onClick={() => setSheet(null)} className="text-primary font-semibold text-sm">Done</button>
                            </div>
                            <div className="space-y-3">
                                {ROLES_FOR_SHEET.map(({ role, icon, description }) => (
                                    <button
                                        key={role}
                                        onClick={() => setRole(sheetMember.id, role)}
                                        className={clsx(
                                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                                            sheetMember.role === role
                                                ? "bg-slate-50 dark:bg-slate-800/50 border-primary/20 ring-1 ring-primary/20"
                                                : "bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={clsx("material-symbols-outlined", sheetMember.role === role ? "text-primary" : "text-slate-500")}>{icon}</span>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold">{role}</p>
                                                <p className="text-[11px] text-slate-500">{description}</p>
                                            </div>
                                        </div>
                                        {sheetMember.role === role && (
                                            <span className="material-symbols-outlined text-primary">check_circle</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
