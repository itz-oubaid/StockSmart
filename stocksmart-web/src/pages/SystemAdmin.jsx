import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEdit2, FiEye, FiMail, FiPlus, FiTrash2, FiUsers, FiGlobe, FiShield } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import { Pagination, Table } from "../components/Table";
import { Alert, Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useTenantsAdmin, useUsersAdmin } from "../hooks/useAdmin";

const EMPTY_TENANT = {
  name: "",
  slug: "",
  plan: "Pro",
  status: "active",
  locale: "fr",
  currency: "EUR",
};

const ROLE_OPTIONS = [
  { value: "Admin Système", label: "Admin Système" },
  { value: "Admin Tenant", label: "Admin Tenant" },
  { value: "Manager", label: "Manager" },
  { value: "Commercial", label: "Commercial" },
  { value: "Magasinier", label: "Magasinier" },
];

export const SystemAdmin = () => {
  const { t } = useTranslation();
  const { user, rolePermissions } = useAuth();
  const { tenants, loading: tenantsLoading, createTenant, updateTenant, deleteTenant } = useTenantsAdmin();
  const { users, loading: usersLoading, updateUser, deleteUser, inviteTenantAdmin } = useUsersAdmin();

  const [activeTab, setActiveTab] = useState("tenants");
  const [tenantPage, setTenantPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [statusMsg, setStatusMsg] = useState({ type: "", message: "" });

  const [tenantModal, setTenantModal] = useState(null);
  const [tenantForm, setTenantForm] = useState(EMPTY_TENANT);
  const [savingTenant, setSavingTenant] = useState(false);

  const [detailTenant, setDetailTenant] = useState(null);
  const [inviteModal, setInviteModal] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "" });
  const [inviting, setInviting] = useState(false);

  const [editUser, setEditUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", role: "", status: "active", tenant_id: "" });

  const itemsPerPage = 8;

  const capabilities = [
    t("admin.cap_login"),
    t("admin.cap_tenants"),
    t("admin.cap_users"),
    t("admin.cap_tenant_crud"),
    t("admin.cap_invite"),
    t("admin.cap_supervise"),
    t("admin.cap_access"),
    t("admin.cap_orgs"),
  ];

  const stats = useMemo(() => ({
    totalTenants: tenants.length,
    activeTenants: tenants.filter((x) => x.status === "active").length,
    totalUsers: users.length,
    pendingInvites: users.filter((x) => (x.status || "").toUpperCase() === "INVITED").length,
  }), [tenants, users]);

  const tenantUsers = useMemo(() => {
    if (!detailTenant) return [];
    return users.filter((u) => u.tenant_id === detailTenant.id);
  }, [users, detailTenant]);

  const paginatedTenants = tenants.slice((tenantPage - 1) * itemsPerPage, tenantPage * itemsPerPage);
  const paginatedUsers = users.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

  const flash = (type, message) => {
    setStatusMsg({ type, message });
    setTimeout(() => setStatusMsg({ type: "", message: "" }), 4000);
  };

  const openCreateTenant = () => {
    setTenantForm(EMPTY_TENANT);
    setTenantModal("create");
  };

  const openEditTenant = (tenant) => {
    setTenantForm({
      name: tenant.name || "",
      slug: tenant.slug || "",
      plan: tenant.plan || "Pro",
      status: tenant.status || "active",
      locale: tenant.locale || "fr",
      currency: tenant.currency || "EUR",
    });
    setTenantModal({ mode: "edit", id: tenant.id });
  };

  const handleSaveTenant = async () => {
    if (!tenantForm.name?.trim() || !tenantForm.slug?.trim()) {
      flash("error", t("admin.tenant_required"));
      return;
    }
    setSavingTenant(true);
    const payload = { ...tenantForm, slug: tenantForm.slug.toLowerCase().replace(/\s+/g, "-") };
    const result =
      tenantModal === "create"
        ? await createTenant(payload)
        : await updateTenant(tenantModal.id, payload);
    setSavingTenant(false);
    if (result.success) {
      setTenantModal(null);
      flash("success", tenantModal === "create" ? t("admin.tenant_created") : t("admin.tenant_updated"));
    } else {
      flash("error", result.error || t("admin.action_failed"));
    }
  };

  const handleDeleteTenant = async (tenant) => {
    if (!window.confirm(t("admin.confirm_delete_tenant", { name: tenant.name }))) return;
    const result = await deleteTenant(tenant.id);
    if (result.success) flash("success", t("admin.tenant_deleted"));
    else flash("error", result.error || t("admin.action_failed"));
  };

  const handleInvite = async () => {
    if (!inviteForm.email?.trim() || !inviteModal?.id) {
      flash("error", t("admin.invite_required"));
      return;
    }
    setInviting(true);
    const result = await inviteTenantAdmin({
      email: inviteForm.email.trim(),
      tenant_id: inviteModal.id,
      name: inviteForm.name.trim() || undefined,
    });
    setInviting(false);
    if (result.success) {
      setInviteModal(null);
      setInviteForm({ email: "", name: "" });
      const temp = result.data?.tempPassword;
      flash(
        "success",
        temp ? t("admin.invite_sent_with_password", { password: temp }) : t("admin.invite_sent")
      );
    } else {
      flash("error", result.error || t("admin.action_failed"));
    }
  };

  const openEditUser = (u) => {
    setEditUser(u);
    setUserForm({
      name: u.name || "",
      role: u.role || "Commercial",
      status: u.status || "active",
      tenant_id: u.tenant_id ?? "",
    });
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    const result = await updateUser(editUser.id, {
      name: userForm.name,
      role: userForm.role,
      status: userForm.status,
      tenant_id: userForm.tenant_id === "" ? null : Number(userForm.tenant_id),
    });
    if (result.success) {
      setEditUser(null);
      flash("success", t("admin.user_updated"));
    } else {
      flash("error", result.error || t("admin.action_failed"));
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.id === user?.id) {
      flash("error", t("admin.cannot_delete_self"));
      return;
    }
    if (!window.confirm(t("admin.confirm_delete_user", { email: u.email }))) return;
    const result = await deleteUser(u.id);
    if (result.success) flash("success", t("admin.user_deleted"));
    else flash("error", result.error || t("admin.action_failed"));
  };

  const tenantColumns = [
    { key: "name", label: t("admin.col_org"), sortable: true },
    { key: "slug", label: t("admin.col_slug"), sortable: true },
    { key: "plan", label: t("admin.col_plan"), sortable: true },
    {
      key: "status",
      label: t("common.status"),
      render: (val) => (
        <Badge variant={val === "active" ? "success" : val === "suspended" ? "error" : "warning"}>
          {val}
        </Badge>
      ),
    },
    { key: "locale", label: t("admin.col_locale") },
    { key: "created_at", label: t("common.created_at") },
    {
      key: "actions",
      label: t("common.actions"),
      render: (_, row) => (
        <div className="flex gap-2">
          <button type="button" className="p-1 text-blue-600 hover:bg-blue-50 rounded" title={t("common.view")} onClick={() => setDetailTenant(row)}>
            <FiEye />
          </button>
          <button type="button" className="p-1 text-indigo-600 hover:bg-indigo-50 rounded" title={t("admin.invite_admin")} onClick={() => { setInviteModal(row); setInviteForm({ email: "", name: "" }); }}>
            <FiMail />
          </button>
          <button type="button" className="p-1 text-amber-600 hover:bg-amber-50 rounded" onClick={() => openEditTenant(row)}>
            <FiEdit2 />
          </button>
          <button type="button" className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={() => handleDeleteTenant(row)}>
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  const userColumns = [
    { key: "name", label: t("common.name"), sortable: true },
    { key: "email", label: t("auth.email"), sortable: true },
    { key: "role", label: t("admin.col_role"), sortable: true },
    { key: "tenant_name", label: t("admin.col_org"), render: (v) => v || "—" },
    {
      key: "status",
      label: t("common.status"),
      render: (val) => (
        <Badge variant={(val || "").toUpperCase() === "ACTIVE" ? "success" : (val || "").toUpperCase() === "INVITED" ? "info" : "warning"}>
          {val}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: t("common.actions"),
      render: (_, row) => (
        <div className="flex gap-2">
          <button type="button" className="p-1 text-amber-600 hover:bg-amber-50 rounded" onClick={() => openEditUser(row)}>
            <FiEdit2 />
          </button>
          <button type="button" className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={() => handleDeleteUser(row)} disabled={row.role === "Admin Système"}>
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: "tenants", label: t("admin.tab_tenants"), icon: FaBuilding },
    { id: "users", label: t("admin.tab_users"), icon: FiUsers },
    { id: "access", label: t("admin.tab_access"), icon: FiShield },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <span className="p-2 bg-violet-600 rounded-lg text-white"><FiGlobe size={22} /></span>
          {t("admin.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">{t("admin.subtitle")}</p>
      </header>

      {statusMsg.message && (
        <Alert variant={statusMsg.type === "success" ? "success" : "error"} message={statusMsg.message} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4 border-l-4 border-l-violet-500">
          <p className="text-xs font-bold uppercase text-slate-400">{t("admin.stat_tenants")}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalTenants}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold uppercase text-slate-400">{t("admin.stat_active_tenants")}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeTenants}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-bold uppercase text-slate-400">{t("admin.stat_users")}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold uppercase text-slate-400">{t("admin.stat_invites")}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.pendingInvites}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">{t("admin.capabilities_title")}</h2>
        <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
          {capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-2">
              <span className="text-violet-500 mt-0.5">•</span>
              <span>{cap}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-violet-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "tenants" && (
        <Card>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("admin.organizations")}</h3>
            <Button onClick={openCreateTenant} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700">
              <FiPlus /> {t("admin.add_tenant")}
            </Button>
          </div>
          {tenantsLoading ? (
            <p className="text-slate-500">{t("common.loading")}</p>
          ) : (
            <>
              <Table columns={tenantColumns} data={paginatedTenants} />
              <Pagination currentPage={tenantPage} totalPages={Math.ceil(tenants.length / itemsPerPage) || 1} onPageChange={setTenantPage} />
            </>
          )}
        </Card>
      )}

      {activeTab === "users" && (
        <Card>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t("admin.all_users")}</h3>
          {usersLoading ? (
            <p className="text-slate-500">{t("common.loading")}</p>
          ) : (
            <>
              <Table columns={userColumns} data={paginatedUsers} />
              <Pagination currentPage={userPage} totalPages={Math.ceil(users.length / itemsPerPage) || 1} onPageChange={setUserPage} />
            </>
          )}
        </Card>
      )}

      {activeTab === "access" && (
        <Card>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t("admin.global_access")}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t("admin.global_access_desc")}</p>
          <div className="space-y-4">
            {Object.entries(rolePermissions).map(([role, config]) => (
              <div key={role} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">{config.label || role}</span>
                  <Badge variant="info">{config.scope}</Badge>
                </div>
                <p className="text-xs text-slate-500 mb-2">{t("admin.permissions")}:</p>
                <div className="flex flex-wrap gap-1">
                  {(config.permissions || []).map((p) => (
                    <Badge key={p} variant="gray">{p}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        open={!!tenantModal}
        onClose={() => setTenantModal(null)}
        title={tenantModal === "create" ? t("admin.add_tenant") : t("admin.edit_tenant")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTenantModal(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleSaveTenant} disabled={savingTenant} className="bg-violet-600 hover:bg-violet-700">
              {savingTenant ? t("common.saving") : t("common.save")}
            </Button>
          </>
        }
      >
        <Input label={t("admin.col_org")} required value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} />
        <Input label={t("admin.col_slug")} required value={tenantForm.slug} onChange={(e) => setTenantForm({ ...tenantForm, slug: e.target.value })} />
        <Select label={t("admin.col_plan")} value={tenantForm.plan} onChange={(e) => setTenantForm({ ...tenantForm, plan: e.target.value })} options={[
          { value: "Basic", label: "Basic" },
          { value: "Pro", label: "Pro" },
          { value: "Enterprise", label: "Enterprise" },
        ]} />
        <Select label={t("common.status")} value={tenantForm.status} onChange={(e) => setTenantForm({ ...tenantForm, status: e.target.value })} options={[
          { value: "active", label: t("common.active") },
          { value: "inactive", label: t("common.inactive") },
          { value: "suspended", label: t("admin.status_suspended") },
        ]} />
        <Select label={t("settings.language")} value={tenantForm.locale} onChange={(e) => setTenantForm({ ...tenantForm, locale: e.target.value })} options={[
          { value: "en", label: t("settings.lang_en") },
          { value: "fr", label: t("settings.lang_fr") },
          { value: "es", label: t("settings.lang_es") },
        ]} />
        <Select label={t("settings.currency")} value={tenantForm.currency} onChange={(e) => setTenantForm({ ...tenantForm, currency: e.target.value })} options={[
          { value: "EUR", label: "EUR (€)" },
          { value: "USD", label: "USD ($)" },
        ]} />
      </Modal>

      <Modal open={!!detailTenant} onClose={() => setDetailTenant(null)} title={t("admin.org_details")} className="max-w-lg">
        {detailTenant && (
          <div className="space-y-3 text-sm">
            <p><strong>{t("admin.col_org")}:</strong> {detailTenant.name}</p>
            <p><strong>{t("admin.col_slug")}:</strong> {detailTenant.slug}</p>
            <p><strong>{t("admin.col_plan")}:</strong> {detailTenant.plan}</p>
            <p><strong>{t("common.status")}:</strong> {detailTenant.status}</p>
            <p><strong>{t("settings.language")}:</strong> {detailTenant.locale}</p>
            <p><strong>{t("settings.currency")}:</strong> {detailTenant.currency}</p>
            <p><strong>{t("common.created_at")}:</strong> {detailTenant.created_at || "—"}</p>
            <hr className="border-slate-200 dark:border-slate-700" />
            <p className="font-semibold">{t("admin.org_users")} ({tenantUsers.length})</p>
            {tenantUsers.length === 0 ? (
              <p className="text-slate-500">{t("admin.no_users_tenant")}</p>
            ) : (
              <ul className="space-y-1">
                {tenantUsers.map((u) => (
                  <li key={u.id} className="flex justify-between gap-2">
                    <span>{u.name || u.email}</span>
                    <Badge variant="gray">{u.role}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Button className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => { setInviteModal(detailTenant); setDetailTenant(null); }}>
              <FiMail className="inline mr-2" />{t("admin.invite_admin")}
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        open={!!inviteModal}
        onClose={() => setInviteModal(null)}
        title={t("admin.invite_admin")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteModal(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleInvite} disabled={inviting} className="bg-indigo-600 hover:bg-indigo-700">
              {inviting ? t("common.saving") : t("admin.send_invite")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-500 mb-4">{t("admin.invite_desc", { name: inviteModal?.name })}</p>
        <Input label={t("auth.email")} type="email" required value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
        <Input label={t("common.name")} value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
      </Modal>

      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={t("admin.edit_user")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditUser(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleSaveUser} className="bg-violet-600 hover:bg-violet-700">{t("common.save")}</Button>
          </>
        }
      >
        <Input label={t("common.name")} value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
        <Select label={t("admin.col_role")} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} options={ROLE_OPTIONS} />
        <Select label={t("common.status")} value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })} options={[
          { value: "active", label: t("common.active") },
          { value: "inactive", label: t("common.inactive") },
          { value: "INVITED", label: t("admin.status_invited") },
        ]} />
        <Select
          label={t("admin.col_org")}
          value={String(userForm.tenant_id)}
          onChange={(e) => setUserForm({ ...userForm, tenant_id: e.target.value })}
          options={[
            { value: "", label: t("admin.no_tenant") },
            ...tenants.map((tn) => ({ value: String(tn.id), label: tn.name })),
          ]}
        />
      </Modal>
    </div>
  );
};
