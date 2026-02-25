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
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");
    const [inviteRole, setInviteRole] = useState<Role>("Developer");
    const [inviting, setInviting] = useState(false);

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

    const removeMember = async (memberId: string, memberName: string) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;

        setMembers(prev => prev.filter(m => m.id !== memberId));

        await fetch(`/api/team?id=${memberId}`, {
            method: "DELETE",
        });
    };

    const sheetMember = members.find((m) => m.id === sheet);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        try {
            const res = await fetch("/api/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: inviteName,
                    email: inviteEmail,
                    role: inviteRole,
                    permissions: { refunds: false, apiKeys: false }
                })
            });
            if (res.ok) {
                await loadMembers();
                setIsInviteModalOpen(false);
                setInviteName("");
                setInviteEmail("");
                setInviteRole("Developer");
            } else {
                alert("Failed to invite member.");
            }
        } catch (error) {
            alert("Error inviting member.");
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Header Area */}
            <header className="flex flex-col gap-6 px-4 md:px-8 py-6 md:py-8 shrink-0">
                <div className="flex flex-wrap justify-between items-end gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Access Control</h2>
                        <p className="text-slate-500 dark:text-slate-400">Manage platform users, roles, and security settings.</p>
                    </div>
                    <button onClick={() => setIsInviteModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-blue-600 text-white px-5 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark shadow-sm">
                        <span className="material-symbols-outlined text-lg">add</span>
                        Invite New User
                    </button>
                </div>
                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                        <a aria-current="page" className="border-primary text-primary whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium" href="#">
                            All Users
                        </a>
                        <a className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium" href="#">
                            Roles &amp; Permissions
                        </a>
                        <a className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium" href="#">
                            Audit Logs
                        </a>
                    </nav>
                </div>
            </header>

            {/* Scrollable Content Area */}
            <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 md:pb-8">
                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                    <div className="relative max-w-md w-full flex items-center gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400">search</span>
                            </div>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-slate-900 dark:text-white bg-white dark:bg-[#161920] ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                placeholder="Search users by name, email or role"
                                type="text"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                            className="bg-white dark:bg-[#161920] border-0 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 rounded-lg py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            {filters.map(f => (
                                <option key={f} value={f}>{f === "All" ? "All Roles" : f}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-[#161920] rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 relative">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:pl-6" scope="col">Name</th>
                                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" scope="col">Role</th>
                                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" scope="col">Permissions</th>
                                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6" scope="col">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#161920]">
                                {loading ? (
                                    <tr><td colSpan={4} className="py-12 text-center text-slate-500"><span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={4} className="py-12 text-center text-slate-500 text-sm">No members match your criteria.</td></tr>
                                ) : filtered.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className={clsx("h-10 w-10 rounded-full flex items-center justify-center font-bold", member.avatarColor)}>
                                                        {member.initials}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-slate-900 dark:text-white">{member.name}</div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            <button
                                                onClick={() => ROLE_CONFIG[member.role].canEdit && setSheet(member.id)}
                                                className={clsx(
                                                    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                                                    member.role === 'Admin' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 ring-purple-700/10 dark:ring-purple-400/20' :
                                                        member.role === 'Developer' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-blue-700/10 dark:ring-blue-400/20' :
                                                            'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 ring-orange-700/10 dark:ring-orange-400/20',
                                                    ROLE_CONFIG[member.role].canEdit && "hover:opacity-80 cursor-pointer"
                                                )}
                                            >
                                                {ROLE_CONFIG[member.role].text}
                                            </button>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400 w-64 max-w-sm">
                                            <div className="flex gap-2 flex-wrap">
                                                {PERMISSIONS.map(p => (
                                                    member.permissions[p.id] && (
                                                        <span key={p.id} className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                                            <span className="material-symbols-outlined text-[12px]">{p.icon}</span>
                                                            {p.label}
                                                        </span>
                                                    )
                                                ))}
                                                {Object.values(member.permissions).every(v => !v) && <span className="text-xs text-slate-400 italic">No special permissions</span>}
                                            </div>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <button onClick={() => ROLE_CONFIG[member.role].canEdit && setSheet(member.id)} className="text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            {ROLE_CONFIG[member.role].canEdit && (
                                                <button onClick={() => removeMember(member.id, member.name)} className="text-slate-400 hover:text-red-500 transition-colors ml-4">
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleInvite}>
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="text-lg font-bold">Invite Team Member</h2>
                                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Name</label>
                                    <input
                                        required
                                        value={inviteName}
                                        onChange={(e) => setInviteName(e.target.value)}
                                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        placeholder="e.g. jane@company.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value as Readonly<Role>)}
                                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Developer">Developer</option>
                                        <option value="Auditor">Auditor</option>
                                    </select>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviting}
                                    className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center gap-2"
                                >
                                    {inviting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                                    {inviting ? "Sending Invite..." : "Send Invite"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
