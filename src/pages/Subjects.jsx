// src/pages/Subjects.jsx
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import Modal from "../components/Modal";
import { useTr } from "../store/langStore";
import { useT } from "../i18n/useT";
import { Button, Input, Label, PageHeader, Card } from "../components/ui";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const t = useT();
  const tr = useTr();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "subjects"), (snap) => {
      setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const create = async () => {
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    await addDoc(collection(db, "subjects"), {
      name: name.trim(),
      createdAt: serverTimestamp(),
    });
    setName("");
    setError("");
    setOpen(false);
  };

  const remove = async (id, subName) => {
    const q = query(collection(db, "tests"), where("subjectId", "==", id));
    const snap = await getDocs(q);
    if (!snap.empty) {
      alert(
        `${t("cannotDelete")}: «${tr(subName)}» — ${snap.size} ${t(
          "testsCount"
        )}`
      );
      return;
    }
    if (!window.confirm(`${tr(subName)} — ${t("confirmDelete")}`)) return;
    await deleteDoc(doc(db, "subjects", id));
  };

  return (
    <div>
      <PageHeader
        title={t("subjectsTitle")}
        subtitle={`${t("total")}: ${subjects.length}`}
        action={
          <Button onClick={() => setOpen(true)}>
            <span className="text-lg leading-none">+</span> {t("createSubject")}
          </Button>
        }
      />

      {subjects.length === 0 ? (
        <Card className="p-10 sm:p-16 text-center">
          <div className="text-4xl sm:text-5xl mb-4">📚</div>
          <p className="text-slate-500 text-sm sm:text-base">
            {t("subjectEmpty")}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {subjects.map((s) => (
            <Card
              key={s.id}
              className="group p-4 sm:p-5 hover:shadow-lg hover:shadow-brand-500/10 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 flex items-center justify-center text-lg sm:text-xl">
                    📖
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 leading-tight truncate">
                      {tr(s.name)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t("subject")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => remove(s.id, s.name)}
                  className="md:opacity-0 md:group-hover:opacity-100 w-8 h-8 flex-shrink-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition flex items-center justify-center"
                  title={t("delete")}
                >
                  ✕
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("createSubject")}
      >
        <div className="space-y-4">
          <div>
            <Label>{t("subjectName")}</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder={t("subjectPlaceholder")}
            />
          </div>
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5">
              {error}
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              className="!w-full sm:!w-auto"
            >
              {t("cancel")}
            </Button>
            <Button onClick={create} className="!w-full sm:!w-auto">
              {t("create")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
