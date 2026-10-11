import type { I18nText, Lang, Unit } from "../api/types";

/** Ligne attendue par le backend : [colonne "UnitX", level, maîtrise, doctrine ("0" = active)] */
export type BarracksPayload = string[][];

export const TIERS = ["T5", "T4", "T3", "T2"] as const;
/** Types d'unité tels que stockés en base (clé française) */
export const UNIT_TYPES = ["Infanterie", "Distant", "Cavalerie"] as const;

/** Chemin d'image renvoyé par le backend ("./img/...") → URL absolue */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return "/" + path.replace(/^\.?\//, "");
}

/** Remplace une image introuvable par le logo (une seule fois pour éviter les boucles) */
export function onImgError(event: Event, fallback: string): void {
  const img = event.target as HTMLImageElement;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = fallback;
}

export const EMPTY_WEAPON_IMG = "/img/weapon/vide.png";

/** Image d'arme absente du serveur (arme ajoutée sans image, casse différente) : cadre vide */
export function onWeaponError(event: Event): void {
  onImgError(event, EMPTY_WEAPON_IMG);
}

export function weaponImg(classFr: string | null | undefined): string {
  return classFr ? `/img/weapon/${encodeURIComponent(classFr)}.png` : EMPTY_WEAPON_IMG;
}

export const toInt = (value: string | number | null | undefined, fallback = 0): number => {
  const parsed = parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

/** Influence effective d'une unité (la doctrine d'influence retire 16 %) */
export function unitInfluence(unit: Unit): number {
  const influence = toInt(unit.Unit_influence);
  return unit.DoctrineInflu ? Math.floor(influence * 0.84) : influence;
}

export function isUnlocked(unit: Unit): boolean {
  return unit.Unit_lvl !== "0" && unit.Unit_lvl !== "";
}

export interface UnitGroup {
  key: string;
  tier: string;
  label: string;
  units: Unit[];
}

/**
 * Regroupe les unités par tier (T5 → T2) puis par type, dans l'ordre d'affichage
 * historique du site. `unitTypes` = Gestion.ListUnitType (libellés traduits).
 */
export function groupUnits(units: Unit[], unitTypes: I18nText[] | null, lang: Lang): UnitGroup[] {
  const groups: UnitGroup[] = [];
  for (const tier of TIERS) {
    UNIT_TYPES.forEach((type, index) => {
      const list = units.filter((unit) => unit.Unit_tier === tier && unit.Unit_type.fr === type);
      if (list.length === 0) return;
      const typeLabel = unitTypes?.[index]?.[lang] ?? type;
      groups.push({ key: `${tier}-${type}`, tier, label: `${tier} - ${typeLabel}`, units: list });
    });
  }
  return groups;
}

/** Regroupe les unités par type (onglets de la caserne), triées T5 → T2 */
export function unitsByType(units: Unit[]): Record<(typeof UNIT_TYPES)[number], Unit[]> {
  const order = (unit: Unit) => TIERS.indexOf(unit.Unit_tier as (typeof TIERS)[number]);
  const byType = { Infanterie: [] as Unit[], Distant: [] as Unit[], Cavalerie: [] as Unit[] };
  for (const unit of units) {
    const type = unit.Unit_type.fr as keyof typeof byType;
    if (byType[type]) byType[type].push(unit);
  }
  for (const list of Object.values(byType)) list.sort((a, b) => order(a) - order(b));
  return byType;
}
