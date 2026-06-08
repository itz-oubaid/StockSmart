import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiBox, FiEdit2, FiMail, FiPlus, FiTrash2, FiTruck, FiUsers, FiMapPin } from "react-icons/fi";
import { Table } from "../components/Table";
import { Alert, Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useTenantUsers } from "../hooks/useTenantAdmin";
import { useProducts } from "../hooks/useApi";
import { useSuppliers } from "../hooks/useApi";
import { useDepots } from "../hooks/useTenantAdmin";

const TENANT_ROLES = [
  { value: "Manager", label: "Manager" },
  { value: "Commercial", label: "Commercial" },
  { value: "Magasinier", label: "Magasinier" },
];

const EMPTY_USER = { name: "", email: "", password: "", role: "Commercial" };

export const TenantAdmin = () => {
  const { t } = useTranslation();
  const { user, tenant } = useAuth();
  const { users, loading: usersLoading, createUser, updateUser, deleteUser, inviteUser } = useTenantUsers();
  const { products } = useProducts();
  const { suppliers } = useSuppliers();
  const { depots } = useDepots();

  const [statusMsg, setStatusMsg] = useState({ type: "", message: "" });
  const [userModal, setUserModal] = useState(null);
  const [inviteModal, setInviteModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(EMPTY_USER);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Commercial" });
  const [editForm, setEditForm] = useState({ name: "", role: "", status: "active" });
  const [saving, setSaving] = useState(false);

  const capabilities = [
    t("tenantAdmin.cap_login"),
    t("tenantAdmin.cap_invite"),
    t("tenantAdmin.cap_create"),
    t("tenantAdmin.cap_manage_users"),
    t("tenantAdmin.cap_products"),
    t("tenantAdmin.cap_depots"),
    t("tenantAdmin.cap_suppliers"),
  ];

  const stats = useMemo(() => ({
    users: users.length,
    products: products.length,
    suppliers: suppliers.length,
    depots: depots.length,
    invites: users.filter((u) => (u.status || "").toUpperCase() === "INVITED").length,
  }), [users, products, suppliers, depots]);

  const flash = (type, message) => {
    setStatusMsg({ type, message });
    setTimeout(() => setStatusMsg({ type: "", message: "" }), 4000);
  };

  const handleCreateUser = async () => {
    if (!form.email?.trim() || !form.password?.trim()) {
      flash("error", t("tenantAdmin.user_required"));
      return;
    }
    setSaving(true);
    const result = await createUser(form);
    setSaving(false);
    if (result.success) {
      setUserModal(null);
      setForm(EMPTY_USER);
      flash("success", t("tenantAdmin.user_created"));
    } else {
      flash("error", result.error || t("tenantAdmin.action_failed"));
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.email?.trim()) {
      flash("error", t("tenantAdmin.invite_required"));
      return;
    }
    setSaving(true);
    const result = await inviteUser(inviteForm);
    setSaving(false);
    if (result.success) {
      setInviteModal(false);
      setInviteForm({ name: "", email: "", role: "Commercial" });
      const temp = result.data?.tempPassword;
      flash("success", temp ? t("tenantAdmin.invite_sent_password", { password: temp }) : t("tenantAdmin.invite_sent"));
    } else {
      flash("error", result.error || t("tenantAdmin.action_failed"));
    }
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    const result = await updateUser(editUser.id, editForm);
    if (result.success) {
      setEditUser(null);
      flash("success", t("tenantAdmin.user_updated"));
    } else {
      flash("error", result.error || t("tenantAdmin.action_failed"));
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.id === user?.id) {
      flash("error", t("tenantAdmin.cannot_delete_self"));
      return;
    }
    if (!window.confirm(t("tenantAdmin.confirm_delete", { email: u.email }))) return;
    const result = await deleteUser(u.id);
    if (result.success) flash("success", t("tenantAdmin.user_deleted"));
    else flash("error", result.error || t("tenantAdmin.action_failed"));
  };

  const userColumns = [
    { key: "name", label: t("common.name"), sortable: true },
    { key: "email", label: t("auth.email"), sortable: true },
    { key: "role", label: t("admin.col_role") },
    {
      key: "status",
      label: t("common.status"),
      render: (val) => (
        <Badge variant={(val || "").toUpperCase() === "ACTIVE" ? "success" : "info"}>{val}</Badge>
      ),
    },
    {
      key: "actions",
      label: t("common.actions"),
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="p-1 text-amber-600"
            onClick={() => {
              setEditUser(row);
              setEditForm({ name: row.name || "", role: row.role, status: row.status || "active" });
            }}
          >
            <FiEdit2 />
          </button>
          <button
            type="button"
            className="p-1 text-red-600"
            onClick={() => handleDeleteUser(row)}
            disabled={row.role === "Admin Tenant"}
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  const quickLinks = [
    { to: "/home/products", icon: FiBox, label: t("nav.products"), desc: t("tenantAdmin.link_products"), iconClass: "text-blue-600" },
    { to: "/home/suppliers", icon: FiTruck, label: t("nav.suppliers"), desc: t("tenantAdmin.link_suppliers"), iconClass: "text-orange-600" },
    { to: "/home/depots", icon: FiMapPin, label: t("nav.depots"), desc: t("tenantAdmin.link_depots"), iconClass: "text-teal-600" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <span className="p-2 bg-teal-600 rounded-lg text-white"><FiUsers size={22} /></span>
          {t("tenantAdmin.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {t("tenantAdmin.subtitle", { name: tenant?.name || t("tenantAdmin.your_org") })}
        </p>
      </header>

      {statusMsg.message && (
        <Alert variant={statusMsg.type === "success" ? "success" : "error"} message={statusMsg.message} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="!p-4 border-l-4 border-l-teal-500">
          <p className="text-xs font-bold uppercase text-slate-400">{t("tenantAdmin.stat_users")}</p>
          <p className="text-2xl font-black">{stats.users}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-bold uppercase text-slate-400">{t("nav.products")}</p>
          <p className="text-2xl font-black">{stats.products}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-orange-500">
          <p className="text-xs font-bold uppercase text-slate-400">{t("nav.suppliers")}</p>
          <p className="text-2xl font-black">{stats.suppliers}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-violet-500">
          <p className="text-xs font-bold uppercase text-slate-400">{t("nav.depots")}</p>
          <p className="text-2xl font-black">{stats.depots}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold uppercase text-slate-400">{t("tenantAdmin.stat_invites")}</p>
          <p className="text-2xl font-black">{stats.invites}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">{t("tenantAdmin.capabilities_title")}</h2>
        <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
          {capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              <span>{cap}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="block p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
            >
              <Icon className={`${link.iconClass} mb-2`} size={24} />
              <h3 className="font-bold text-slate-900 dark:text-white">{link.label}</h3>
              <p className="text-sm text-slate-500 mt-1">{link.desc}</p>
            </Link>
          );
        })}
      </div>

      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("tenantAdmin.team")}</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setInviteModal(true)} className="flex items-center gap-2">
              <FiMail /> {t("tenantAdmin.invite_email")}
            </Button>
            <Button onClick={() => { setForm(EMPTY_USER); setUserModal(true); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
              <FiPlus /> {t("tenantAdmin.create_user")}
            </Button>
          </div>
        </div>
        {usersLoading ? (
          <p className="text-slate-500">{t("common.loading")}</p>
        ) : (
          <Table columns={userColumns} data={users} emptyMessage={t("tenantAdmin.no_users")} />
        )}
      </Card>

      <Modal
        open={userModal}
        onClose={() => setUserModal(false)}
        title={t("tenantAdmin.create_user")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setUserModal(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreateUser} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </>
        }
      >
        <Input label={t("common.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label={t("auth.email")} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label={t("auth.password")} type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Select label={t("admin.col_role")} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={TENANT_ROLES} />
      </Modal>

      <Modal
        open={inviteModal}
        onClose={() => setInviteModal(false)}
        title={t("tenantAdmin.invite_email")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteModal(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleInvite} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? t("common.saving") : t("admin.send_invite")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-500 mb-4">{t("tenantAdmin.invite_desc")}</p>
        <Input label={t("common.name")} value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
        <Input label={t("auth.email")} type="email" required value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
        <Select label={t("admin.col_role")} value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })} options={TENANT_ROLES} />
      </Modal>

      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={t("tenantAdmin.edit_user")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditUser(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleSaveUser} className="bg-teal-600 hover:bg-teal-700">{t("common.save")}</Button>
          </>
        }
      >
        <Input label={t("common.name")} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
        <Select label={t("admin.col_role")} value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} options={TENANT_ROLES} />
        <Select label={t("common.status")} value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} options={[
          { value: "active", label: t("common.active") },
          { value: "inactive", label: t("common.inactive") },
          { value: "INVITED", label: t("admin.status_invited") },
        ]} />
      </Modal>
    </div>
  );
};
