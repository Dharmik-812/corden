"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePixelEditorStore } from "@/stores/pixelEditor-store";
import { useEditor3DStore } from "@/stores/editor3d-store";
import {
  createProject,
  loadProject2D,
  loadProject3D,
  saveProject2D,
  saveProject3D,
  getProjectMeta,
} from "@/lib/project-storage";

export type SaveStatus = "saved" | "saving" | "unsaved";

export function useProjectSave2D(projectId: string) {
  const router = useRouter();
  const resolvedId = projectId === "new" ? null : projectId;
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [title, setTitle] = useState("Untitled 2D Draft");
  const loadedRef = useRef(false);
  const autosaveEnabledRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadedRef.current = false;
    autosaveEnabledRef.current = false;
    if (projectId === "new") {
      const meta = createProject("2d");
      router.replace(`/editor/2d/${meta.id}`);
    }
  }, [projectId, router]);

  useEffect(() => {
    if (!resolvedId || loadedRef.current) return;
    loadedRef.current = true;

    const data = loadProject2D(resolvedId);
    const meta = getProjectMeta(resolvedId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (meta) setTitle(meta.title);

    if (data) {
      usePixelEditorStore.setState({
        layers: JSON.parse(JSON.stringify(data.layers)),
        activeLayerId: data.activeLayerId,
        canvasWidth: data.canvasWidth as 8 | 16 | 32 | 48 | 64 | 128,
        canvasHeight: data.canvasHeight as 8 | 16 | 32 | 48 | 64 | 128,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        activePalette: data.activePalette,
        history: [{ layers: JSON.parse(JSON.stringify(data.layers)), activeLayerId: data.activeLayerId }],
        historyIndex: 0,
      });
    }
    setSaveStatus("saved");
    const t = setTimeout(() => { autosaveEnabledRef.current = true; }, 300);
    return () => clearTimeout(t);
  }, [resolvedId]);

  const save = useCallback((overrideTitle?: string) => {
    if (!resolvedId) return;
    setSaveStatus("saving");
    const s = usePixelEditorStore.getState();
    const saveTitle = overrideTitle !== undefined ? overrideTitle : title;
    if (overrideTitle !== undefined) setTitle(overrideTitle);
    
    saveProject2D(
      resolvedId,
      {
        layers: s.layers,
        activeLayerId: s.activeLayerId,
        canvasWidth: s.canvasWidth,
        canvasHeight: s.canvasHeight,
        primaryColor: s.primaryColor,
        secondaryColor: s.secondaryColor,
        activePalette: s.activePalette,
      },
      saveTitle
    );
    setSaveStatus("saved");
  }, [resolvedId, title]);

  useEffect(() => {
    if (!resolvedId || !loadedRef.current) return;

    const unsub = usePixelEditorStore.subscribe((state, prev) => {
      if (!autosaveEnabledRef.current) return;
      if (
        state.layers === prev.layers &&
        state.activeLayerId === prev.activeLayerId &&
        state.canvasWidth === prev.canvasWidth &&
        state.canvasHeight === prev.canvasHeight
      ) return;
      setSaveStatus("unsaved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => save(), 1500);
    });

    return () => {
      unsub();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [resolvedId, save]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  return { resolvedId, saveStatus, save, title, setTitle };
}

export function useProjectSave3D(projectId: string) {
  const router = useRouter();
  const resolvedId = projectId === "new" ? null : projectId;
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [title, setTitle] = useState("Untitled 3D Scene");
  const loadedRef = useRef(false);
  const autosaveEnabledRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadedRef.current = false;
    autosaveEnabledRef.current = false;
    if (projectId === "new") {
      const meta = createProject("3d");
      router.replace(`/editor/3d/${meta.id}`);
    }
  }, [projectId, router]);

  useEffect(() => {
    if (!resolvedId || loadedRef.current) return;
    loadedRef.current = true;

    const data = loadProject3D(resolvedId);
    const meta = getProjectMeta(resolvedId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (meta) setTitle(meta.title);

    if (data) {
      useEditor3DStore.setState({
        objects: JSON.parse(JSON.stringify(data.objects)),
        environmentPreset: data.environmentPreset,
        shadingMode: data.shadingMode,
        selectedId: data.selectedId,
        history: [{ objects: JSON.parse(JSON.stringify(data.objects)), selectedId: data.selectedId }],
        historyIndex: 0,
      });
    }
    setSaveStatus("saved");
    const t = setTimeout(() => { autosaveEnabledRef.current = true; }, 300);
    return () => clearTimeout(t);
  }, [resolvedId]);

  const save = useCallback((overrideTitle?: string) => {
    if (!resolvedId) return;
    setSaveStatus("saving");
    const s = useEditor3DStore.getState();
    const saveTitle = overrideTitle !== undefined ? overrideTitle : title;
    if (overrideTitle !== undefined) setTitle(overrideTitle);
    
    saveProject3D(
      resolvedId,
      {
        objects: JSON.parse(JSON.stringify(s.objects)),
        environmentPreset: s.environmentPreset,
        shadingMode: s.shadingMode,
        selectedId: s.selectedId,
      },
      saveTitle
    );
    setSaveStatus("saved");
  }, [resolvedId, title]);

  useEffect(() => {
    if (!resolvedId || !loadedRef.current) return;

    const unsub = useEditor3DStore.subscribe((state, prev) => {
      if (!autosaveEnabledRef.current) return;
      if (state.objects === prev.objects) return;
      setSaveStatus("unsaved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => save(), 1500);
    });

    return () => {
      unsub();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [resolvedId, save]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  return { resolvedId, saveStatus, save, title, setTitle };
}
