import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Table } from "../components/Table";
import { Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useDepots } from "../hooks/useTenantAdmin";

const EMPTY_DEPOT = { name: "", address: "", type: "warehouse" };

export const Depots = () => {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const { depots, loading, error, createDepot, updateDepot, deleteDepot } = useDepots();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_DEPOT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const canManage = hasPermission("manage_depots");

  const openCreate = () => {
    setForm(EMPTY_DEPOT);
    setModal("create");
    setFormError("");
  };

  const openEdit = (depot) => {
    setForm({
      name: depot.name || "",
      address: depot.address || "",
      type: depot.type || "warehouse",
    });
    setModal({ mode: "edit", id: depot.id });
    setFormError("");
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      setFormError(t("depots.name_required"));
      return;
    }
    setSaving(true);
    const result =
      modal === "create"
        ? await createDepot(form)
        : await updateDepot(modal.id, form);
    setSaving(false);
    if (result.success) setModal(null);
    else setFormError(result.error || t("tenantAdmin.action_failed"));
  };

  const handleDelete = async (depot) => {
    if (!window.confirm(t("depots.confirm_delete", { name: depot.name }))) return;
    await deleteDepot(depot.id);
  };

  const columns = [
    { key: "name", label: t("common.name"), sortable: true },
    { key: "address", label: t("depots.address") },
    {
      key: "type",
      label: t("common.type"),
      render: (val) => <Badge variant="info">{val}</Badge>,
    },
    ...(canManage
      ? [{
          key: "actions",
          label: t("common.actions"),
          render: (_, row) => (
            <div className="flex gap-2">
              <button type="button" className="p-1 text-amber-600" onClick={() => openEdit(row)}><FiEdit2 /></button>
              <button type="button" className="p-1 text-red-600" onClick={() => handleDelete(row)}><FiTrash2 /></button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t("depots.title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t("depots.subtitle")}</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
            <FiPlus /> {t("depots.add")}
          </Button>
        )}
      </div>

      {error && (
        <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm">
          {t("depots.offline_notice")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!p-4">
          <p className="text-xs font-bold uppercase text-slate-400">{t("depots.total")}</p>
          <p className="text-2xl font-black">{loading ? "—" : depots.length}</p>
        </Card>
      </div>

      <Card>
        {loading ? (
          <p className="text-slate-500">{t("common.loading")}</p>
        ) : (
          <Table columns={columns} data={depots} emptyMessage={t("depots.no_depots")} />
        )}
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "create" ? t("depots.add") : t("depots.edit")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </>
        }
      >
        {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
        <Input label={t("common.name")} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label={t("depots.address")} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <Select
          label={t("common.type")}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          options={[
            { value: "warehouse", label: t("depots.type_warehouse") },
            { value: "depot", label: t("depots.type_depot") },
            { value: "store", label: t("depots.type_store") },
          ]}
        />
      </Modal>
    </div>
  );
};
