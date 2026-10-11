<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePage } from "../api/usePage";
import type { Unit, UserInfo } from "../api/types";
import { OFFICER_UNIT_VALUE } from "../config";
import { lang, t, tr } from "../i18n";
import { confirmDialog } from "../stores/confirm";
import {
  buildGroups,
  buildSavePayload,
  emptyGroup,
  emptySlot,
  findUnit,
  playerInfluence,
  unitsInfluence,
  type Group,
  type Slot,
} from "../utils/groups";
import { groupUnits, isUnlocked, TIERS, unitInfluence, weaponImg } from "../utils/units";

const route = useRoute();
const router = useRouter();

const LOAD_ENDPOINTS = { att: "chargergrouptypeatt", def: "chargergrouptypedef" } as const;
const initialEndpoint: string = LOAD_ENDPOINTS[route.query.load as keyof typeof LOAD_ENDPOINTS] ?? "creategroup";

const { data, loading, busy, load, submit } = usePage(initialEndpoint, "officier");

const tg = computed(() => t.value.create_group);
const groups = ref<Group[]>([]);
const snapshot = ref("");
const typeLoaded = ref(initialEndpoint !== "creategroup");
const tierFilter = ref<string[]>([...TIERS]);
const whoUnit = ref("");

watch(data, (value) => {
  if (!value) return;
  groups.value = buildGroups(value, lang.value);
  snapshot.value = JSON.stringify(groups.value);
});

const dirty = computed(() => JSON.stringify(groups.value) !== snapshot.value);

// Les unités sont identifiées par leur nom traduit : on suit le changement de langue
watch(lang, (value) => {
  const wasDirty = dirty.value;
  for (const group of groups.value) {
    for (const slot of group.slots) {
      const caserne = playerOf(slot)?.UserCaserne;
      slot.units = slot.units.map((name) => (name && name !== OFFICER_UNIT_VALUE ? (findUnit(caserne, name)?.Unit_name[value] ?? name) : name));
    }
  }
  if (!wasDirty) snapshot.value = JSON.stringify(groups.value);
});

// ------------------------------- Inscrits --------------------------------
const inscripted = computed<UserInfo[]>(() => data.value?.ListInscripted ?? []);
const playersByName = computed(() => new Map(inscripted.value.map((user) => [user.Username, user])));
const placed = computed(() => new Set(groups.value.flatMap((group) => group.slots.map((slot) => slot.username)).filter(Boolean)));

const playerOf = (slot: Slot) => playersByName.value.get(slot.username);
const isLate = (player: UserInfo | undefined) => player?.EtatInscription === 2;

/** Joueurs sélectionnables pour un emplacement : non placés ailleurs */
function availablePlayers(slot: Slot): UserInfo[] {
  return inscripted.value.filter((player) => player.Username === slot.username || !placed.value.has(player.Username));
}

function onPlayerChange(slot: Slot) {
  slot.units = emptySlot().units;
  slot.commentOn = false;
  slot.comment = "";
}

// -------------------------------- Unités ---------------------------------
const MASTERY_ICON: Record<string, string> = { "0": "🔴 ", "1": "🟡 ", "2": "🟢 " };

function unitLabel(unit: Unit): string {
  const icon = unit.Unit_maitrise === "1" ? (MASTERY_ICON[unit.UserMaitrise] ?? "") : "";
  return `${icon}${tr(unit.Unit_name)} (lvl ${unit.Unit_lvl})`;
}

/**
 * Options d'unité pour la n-ième unité d'un joueur : unités débloquées, filtrées par tier,
 * hors unités déjà choisies et hors unités qui dépasseraient son influence.
 */
function unitGroups(slot: Slot, index: number) {
  const player = playerOf(slot);
  if (!player?.UserCaserne) return [];
  const current = slot.units[index];
  const others = slot.units.filter((_, i) => i !== index);
  const budget = playerInfluence(player) - unitsInfluence(player, others);

  const candidates = player.UserCaserne.filter((unit) => {
    const name = unit.Unit_name[lang.value];
    if (name === current) return true;
    return isUnlocked(unit) && tierFilter.value.includes(unit.Unit_tier) && !others.includes(name) && unitInfluence(unit) <= budget;
  });
  return groupUnits(
    [...candidates].sort((a, b) => tr(a.Unit_name).localeCompare(tr(b.Unit_name))),
    data.value?.Gestion.ListUnitType ?? null,
    lang.value,
  );
}

/** Valeur enregistrée inconnue de la caserne actuelle (unité supprimée, etc.) */
function orphanValue(slot: Slot, index: number): string | null {
  const value = slot.units[index];
  if (!value || value === OFFICER_UNIT_VALUE || findUnit(playerOf(slot)?.UserCaserne, value)) return null;
  return value;
}

function slotInfluence(slot: Slot): number {
  return unitsInfluence(playerOf(slot), slot.units);
}

const allTiers = computed({
  get: () => tierFilter.value.length === TIERS.length,
  set: (value: boolean) => (tierFilter.value = value ? [...TIERS] : []),
});

// ------------------------- Qui a l'unité ? -------------------------------
const allUnitGroups = computed(() => groupUnits(data.value?.ListUnit ?? [], data.value?.Gestion.ListUnitType ?? null, lang.value));
const whoHasUnit = computed(() => {
  const unit = data.value?.ListUnit?.find((item) => item.Unit_id === whoUnit.value);
  if (!unit) return null;
  return inscripted.value
    .map((player) => ({ player, owned: player.UserCaserne?.find((item) => item.Unit_id === unit.Unit_id) }))
    .filter(({ owned }) => owned && isUnlocked(owned));
});

// ------------------------------- Actions ---------------------------------
function addGroup() {
  groups.value.push(emptyGroup());
}

async function removeGroup(index: number) {
  if (await confirmDialog(t.value.pwa.confirm_remove_group)) groups.value.splice(index, 1);
}

async function save(optiontype: "current" | "SaveGroupTypeAtt" | "SaveGroupTypeDef") {
  if (optiontype !== "current" && !(await confirmDialog(t.value.pwa.confirm_save_type))) return;
  const response = await submit("saveGroupInDB", buildSavePayload(groups.value, optiontype, data.value?.NameGroupGvG ?? null));
  if (response) typeLoaded.value = false;
}

async function loadType(type: keyof typeof LOAD_ENDPOINTS) {
  if (dirty.value && !(await confirmDialog(t.value.pwa.confirm_discard))) return;
  const response = await load(LOAD_ENDPOINTS[type]);
  if (response) typeLoaded.value = true;
}

// Un rechargement de la page ne doit pas recharger le groupe type
if (route.query.load) router.replace({ query: {} });

async function preview() {
  if (dirty.value && !(await confirmDialog(t.value.pwa.confirm_discard))) return;
  router.push("/viewGroup");
}
</script>

<template>
  <div v-if="loading && !data" class="spinner" role="status" />

  <div v-else-if="data" class="stack">
    <div class="row row--between">
      <h1>{{ t.home.groupGvG }}</h1>
      <button v-if="data.GroupGvG?.length" type="button" class="btn btn--ghost" @click="preview">👁 {{ tg.preview }}</button>
    </div>

    <!-- Liste des inscrits -->
    <details class="collapse">
      <summary>{{ tg.list_users.title.replace("》 ", "") }} ({{ placed.size }} / {{ inscripted.length }})</summary>
      <div class="collapse__body stack">
        <p class="muted small">{{ tg.list_users.listLegendplaced.join(" · ") }}</p>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th />
                <th>{{ tg.list_users.username }}</th>
                <th v-html="tg.list_users.influ" />
                <th>{{ tg.list_users.class }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in inscripted" :key="player.ID">
                <td>{{ placed.has(player.Username) ? "✅" : "❌" }}</td>
                <td>{{ isLate(player) ? "🕐 " : "" }}{{ player.Username }}</td>
                <td>{{ player.Influence }}</td>
                <td>
                  <span class="row">
                    <img class="weapon-icon" :src="weaponImg(player.GameCharacter.fr)" alt="" />
                    {{ tr(player.GameCharacter) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </details>

    <!-- Qui a l'unité ? -->
    <details class="collapse">
      <summary>{{ tg.who_have_unit.title.replace("》 ", "") }}</summary>
      <div class="collapse__body stack">
        <select v-model="whoUnit">
          <option value="">{{ tg.select }}</option>
          <optgroup v-for="group in allUnitGroups" :key="group.key" :label="group.label">
            <option v-for="unit in group.units" :key="unit.Unit_id" :value="unit.Unit_id">{{ tr(unit.Unit_name) }}</option>
          </optgroup>
        </select>
        <p v-if="!whoHasUnit" class="muted">{{ tg.who_have_unit.who }}</p>
        <p v-else-if="whoHasUnit.length === 0" class="muted">{{ tg.who_have_unit.no_player }}</p>
        <div v-else class="row">
          <span v-for="{ player, owned } in whoHasUnit" :key="player.ID" class="badge" :class="{ 'badge--success': placed.has(player.Username) }">
            {{ player.Username }} · lvl {{ owned?.Unit_lvl }}{{ owned?.Unit_maitrise === "1" ? " " + (MASTERY_ICON[owned.UserMaitrise] ?? "") : "" }}
          </span>
        </div>
      </div>
    </details>

    <!-- Création des groupes -->
    <section class="card stack">
      <div class="row row--between">
        <h2>{{ tg.create_group.title.replace("》 ", "") }}</h2>
        <span v-if="typeLoaded" class="badge badge--warning">{{ t.pwa.type_loaded }}</span>
      </div>

      <div class="row toolbar">
        <span class="muted small">{{ tg.legend.title }} {{ tg.create_group.listLegend.join(" · ") }}</span>
      </div>
      <div class="row toolbar">
        <span class="muted small">{{ tg.create_group.filter.title }}</span>
        <label class="switch">
          <input v-model="allTiers" type="checkbox" />
          <span class="switch__track" />
          <span class="small">{{ tg.create_group.listFilter[0] }}</span>
        </label>
        <label v-for="tier in [...TIERS].reverse()" :key="tier" class="switch">
          <input v-model="tierFilter" type="checkbox" :value="tier" />
          <span class="switch__track" />
          <span class="small">{{ tier }}</span>
        </label>
      </div>

      <article v-for="(group, gIndex) in groups" :key="gIndex" class="group" :class="{ 'group--alt': gIndex % 2 === 1 }">
        <header class="group__header">
          <span class="group__number">#{{ gIndex + 1 }}</span>
          <input v-model="group.name" type="text" maxlength="60" :placeholder="tg.legend.namegroup" :aria-label="tg.legend.namegroup" />
          <button type="button" class="btn btn--ghost btn--sm" :title="t.pwa.remove_group" @click="removeGroup(gIndex)">🗑</button>
        </header>

        <div v-for="(slot, sIndex) in group.slots" :key="sIndex" class="slot">
          <div class="slot__player">
            <img class="weapon-icon" :src="weaponImg(playerOf(slot)?.GameCharacter.fr)" alt="" />
            <select v-model="slot.username" :aria-label="tg.legend.username" @change="onPlayerChange(slot)">
              <option value="">{{ tg.select }}</option>
              <option v-for="player in availablePlayers(slot)" :key="player.ID" :value="player.Username">
                {{ isLate(player) ? "🕐 " : "" }}{{ player.Username }}
              </option>
            </select>
            <span
              v-if="slot.username"
              class="slot__influence"
              :class="{ 'text-danger': slotInfluence(slot) > playerInfluence(playerOf(slot)) }"
              :title="tg.legend.influ.replace('<br>', '')"
            >
              {{ slotInfluence(slot) }} / {{ playerInfluence(playerOf(slot)) }}
            </span>
          </div>

          <template v-if="slot.username">
            <div class="slot__units">
              <select v-for="uIndex in 4" :key="uIndex" v-model="slot.units[uIndex - 1]" :aria-label="`${tg.legend.unit1.slice(0, -1)}${uIndex}`">
                <option value="">{{ tg.select }}</option>
                <option v-if="orphanValue(slot, uIndex - 1)" :value="orphanValue(slot, uIndex - 1)!">{{ orphanValue(slot, uIndex - 1) }}</option>
                <optgroup :label="tg.create_group.selectmenu.title">
                  <option :value="OFFICER_UNIT_VALUE" class="officer">{{ tg.create_group.selectmenu.other }}</option>
                </optgroup>
                <optgroup v-for="unitGroup in unitGroups(slot, uIndex - 1)" :key="unitGroup.key" :label="unitGroup.label">
                  <option v-for="unit in unitGroup.units" :key="unit.Unit_id" :value="unit.Unit_name[lang]">{{ unitLabel(unit) }}</option>
                </optgroup>
              </select>
            </div>
            <div class="slot__comment">
              <label class="switch">
                <input v-model="slot.commentOn" type="checkbox" />
                <span class="switch__track" />
                <span class="small">{{ tg.create_group.comment.usercomment }}</span>
              </label>
              <input v-if="slot.commentOn" v-model="slot.comment" type="text" maxlength="200" :placeholder="`${tg.create_group.comment.placeholder} ${slot.username}`" />
            </div>
          </template>
        </div>
      </article>

      <button type="button" class="btn btn--ghost" @click="addGroup">{{ tg.create_group.add_group }}</button>

      <details class="collapse">
        <summary>{{ tg.create_group.group_type.title.replace("》 ", "") }}</summary>
        <div class="collapse__body stack">
          <p class="alert alert--warning small" v-html="tg.create_group.group_type.description" />
          <div class="grid" style="--min: 240px">
            <div class="stack">
              <h3>{{ tg.create_group.group_type.save }}</h3>
              <div class="row">
                <button type="button" class="btn btn--ghost" :disabled="busy" @click="save('SaveGroupTypeAtt')">⚔️ {{ tg.create_group.group_type.att }}</button>
                <button type="button" class="btn btn--ghost" :disabled="busy" @click="save('SaveGroupTypeDef')">🛡️ {{ tg.create_group.group_type.def }}</button>
              </div>
            </div>
            <div class="stack">
              <h3>{{ tg.create_group.group_type.load }}</h3>
              <div class="row">
                <button type="button" class="btn btn--ghost" :disabled="loading" @click="loadType('att')">⚔️ {{ tg.create_group.group_type.att }}</button>
                <button type="button" class="btn btn--ghost" :disabled="loading" @click="loadType('def')">🛡️ {{ tg.create_group.group_type.def }}</button>
              </div>
            </div>
          </div>
        </div>
      </details>
    </section>

    <div class="savebar" :class="{ 'savebar--dirty': dirty || typeLoaded }">
      <span v-if="dirty || typeLoaded">{{ t.pwa.unsaved }}</span>
      <span v-else class="muted small">{{ placed.size }} / {{ inscripted.length }}</span>
      <button type="button" class="btn btn--primary" :disabled="busy" @click="save('current')">{{ tg.create_group.save_group }}</button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  gap: 14px;
}
.weapon-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.group--alt {
  background: var(--surface-3);
}
.group__header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.group__number {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--accent);
}
.group__header input {
  max-width: 320px;
}
.slot {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(0, 3fr);
  gap: 8px 12px;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid var(--border);
}
.slot__player {
  display: flex;
  align-items: center;
  gap: 8px;
}
.slot__influence {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  white-space: nowrap;
}
.slot__units {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}
.slot__comment {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 12px;
}
.slot__comment input[type="text"] {
  flex: 1;
}
.officer {
  color: var(--danger);
}
.savebar {
  position: sticky;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius);
  background: var(--surface-solid);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow);
}
.savebar--dirty {
  border-color: var(--warning);
}
@media (max-width: 900px) {
  .slot {
    grid-template-columns: 1fr;
  }
  .slot__units {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
