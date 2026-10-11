import type { ApiResponse, Lang, Unit, UserInfo } from "../api/types";
import { OFFICER_UNIT_VALUE, OFFICER_UNIT_VALUES } from "../config";
import { stripTags } from "./format";
import { toInt, unitInfluence } from "./units";

export const SLOTS_PER_GROUP = 5;
export const UNITS_PER_PLAYER = 4;

export interface Slot {
  username: string;
  /** Nom d'unité (langue courante) ou OFFICER_UNIT_VALUE */
  units: string[];
  commentOn: boolean;
  comment: string;
}

export interface Group {
  name: string;
  slots: Slot[];
}

export const emptySlot = (): Slot => ({
  username: "",
  units: Array(UNITS_PER_PLAYER).fill(""),
  commentOn: false,
  comment: "",
});

export const emptyGroup = (): Group => ({
  name: "",
  slots: Array.from({ length: SLOTS_PER_GROUP }, emptySlot),
});

export function findUnit(caserne: Unit[] | null | undefined, name: string): Unit | undefined {
  if (!name || !caserne) return undefined;
  return caserne.find((unit) => unit.Unit_name.fr === name || unit.Unit_name.en === name);
}

/** Les unités sont enregistrées par leur nom : on accepte FR ou EN et on affiche la langue courante */
function normalizeUnit(saved: string, caserne: Unit[] | null, lang: Lang): string {
  if (!saved) return "";
  if (OFFICER_UNIT_VALUES.includes(saved)) return OFFICER_UNIT_VALUE;
  return findUnit(caserne, saved)?.Unit_name[lang] ?? saved;
}

/** Reconstruit les groupes éditables à partir de la réponse du backend */
export function buildGroups(data: ApiResponse, lang: Lang): Group[] {
  const saved = data.GroupGvG ?? [];
  const inscripted = new Map((data.ListInscripted ?? []).map((user) => [user.ID, user]));
  const groupCount = saved.reduce((max, line) => Math.max(max, line.GroupNumber), 0);

  const groups: Group[] = [];
  for (let number = 1; number <= groupCount; number++) {
    const group = emptyGroup();
    group.name = (data.NameGroupGvG?.[number] ?? "").trim();
    saved
      .filter((line) => line.GroupNumber === number)
      .slice(0, SLOTS_PER_GROUP)
      .forEach((line, index) => {
        // Joueur plus inscrit (ex : groupe type) : ligne laissée vide
        const player = inscripted.get(line.User_ID);
        if (!player) return;
        group.slots[index] = {
          username: player.Username,
          units: [line.Unit1, line.Unit2, line.Unit3, line.Unit4].map((unit) => normalizeUnit(unit, player.UserCaserne, lang)),
          commentOn: Boolean(line.commentaire),
          comment: line.commentaire ?? "",
        };
      });
    groups.push(group);
  }
  return groups.length ? groups : [emptyGroup()];
}

export function playerInfluence(player: UserInfo | undefined): number {
  return toInt(player?.Influence) || 700;
}

export function unitsInfluence(player: UserInfo | undefined, units: string[]): number {
  return units.reduce((total, name) => {
    const unit = findUnit(player?.UserCaserne, name);
    return total + (unit ? unitInfluence(unit) : 0);
  }, 0);
}

/**
 * Corps attendu par /api/saveGroupInDB/.
 * Le backend ignore la 1re ligne (historiquement l'en-tête du tableau) : on envoie une ligne vide.
 * Il n'enregistre les noms que si le 1er élément de `namegroup` est non vide et ne sait pas supprimer
 * un nom : les noms vidés (ou de groupes supprimés) sont écrasés par " ", ignoré à l'affichage.
 */
export function buildSavePayload(
  groups: Group[],
  optiontype: "current" | "SaveGroupTypeAtt" | "SaveGroupTypeDef",
  savedNames: Record<string, string> | null = null,
) {
  const dataToSend = [{ inputValue: "", selectValues: [] as string[], commentaire: "" }];
  groups.forEach((group, index) => {
    for (const slot of group.slots) {
      dataToSend.push({
        inputValue: `group${index + 1}`,
        selectValues: slot.username ? [slot.username, ...slot.units] : [""],
        commentaire: slot.username && slot.commentOn ? stripTags(slot.comment.trim()) : "",
      });
    }
  });

  const namegroup = groups.map((group, index) => [String(index + 1), stripTags(group.name.trim())]).filter(([, name]) => name !== "");
  const named = new Set(namegroup.map(([number]) => number));
  for (const [number, name] of Object.entries(savedNames ?? {})) {
    if (name.trim() && !named.has(number)) namegroup.push([number, " "]);
  }

  return { dataToSend, namegroup, optiontype };
}
