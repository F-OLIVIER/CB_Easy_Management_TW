<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { I18nText, Unit } from "../api/types";
import { lang, t, tr } from "../i18n";
import logo from "../assets/logo.webp";
import { assetUrl, onImgError, TIERS, toInt, UNIT_TYPES, unitsByType, type BarracksPayload } from "../utils/units";

const props = defineProps<{
  units: Unit[];
  unitTypes: I18nText[] | null;
  busy?: boolean;
  saveLabel: string;
}>();

const emit = defineEmits<{ save: [payload: BarracksPayload] }>();

interface UnitState {
  /** "" = inchangé, "-1" = non débloquée, sinon nouveau level */
  lvl: string;
  maitrise: string;
  doctrine: boolean;
}

const state = reactive<Record<string, UnitState>>({});
const activeType = ref<(typeof UNIT_TYPES)[number]>("Infanterie");
const search = ref("");
const onlyUnlocked = ref(false);
/** Tiers cochés ; aucun = tous les tiers */
const TIER_FILTERS = [...TIERS].reverse();
const tierFilter = ref<string[]>([]);

function reset() {
  for (const key of Object.keys(state)) delete state[key];
  for (const unit of props.units) {
    state[unit.Unit_id] = { lvl: "", maitrise: unit.UserMaitrise || "0", doctrine: unit.DoctrineInflu };
  }
}
watch(() => props.units, reset, { immediate: true });

const byType = computed(() => unitsByType(props.units));
const typeLabel = (index: number) => props.unitTypes?.[index]?.[lang.value] ?? UNIT_TYPES[index];

const visibleUnits = computed(() => {
  const query = search.value.trim().toLowerCase();
  return byType.value[activeType.value].filter((unit) => {
    if (onlyUnlocked.value && effectiveLvl(unit) === 0) return false;
    if (tierFilter.value.length > 0 && !tierFilter.value.includes(unit.Unit_tier)) return false;
    return !query || unit.Unit_name.fr.toLowerCase().includes(query) || unit.Unit_name.en.toLowerCase().includes(query);
  });
});

function effectiveLvl(unit: Unit): number {
  const value = state[unit.Unit_id]?.lvl ?? "";
  if (value === "") return toInt(unit.Unit_lvl);
  return value === "-1" ? 0 : toInt(value);
}

function lvlClass(unit: Unit): string {
  const lvl = effectiveLvl(unit);
  if (lvl === 0) return "lvl--none";
  return lvl >= toInt(unit.Unit_lvlMax) ? "lvl--max" : "lvl--partial";
}

/** Paliers proposés : tous les 5 levels + level max */
function levelOptions(unit: Unit): number[] {
  const max = toInt(unit.Unit_lvlMax);
  const levels: number[] = [];
  for (let level = 1; level <= max; level++) if (level % 5 === 0 || level === max) levels.push(level);
  return levels;
}

const masteryOptions = computed(() => t.value.caserne.listoption_maitrise as [string, string, string][]);
const masteryColor = (value: string) => masteryOptions.value.find(([key]) => key === value)?.[2] ?? "red";

const dirtyCount = computed(
  () =>
    props.units.filter((unit) => {
      const current = state[unit.Unit_id];
      return current && (current.lvl !== "" || current.doctrine !== unit.DoctrineInflu || (unit.Unit_maitrise === "1" && current.maitrise !== (unit.UserMaitrise || "0")));
    }).length,
);

function save() {
  const payload: BarracksPayload = props.units.map((unit) => {
    const current = state[unit.Unit_id];
    return [`Unit${unit.Unit_id}`, current.lvl, unit.Unit_maitrise === "1" ? current.maitrise : "", current.doctrine ? "0" : "1"];
  });
  emit("save", payload);
}
</script>

<template>
  <div class="stack">
    <section class="card filters" aria-labelledby="filters-title">
      <header class="filters__head">
        <h2 id="filters-title" class="filters__title">{{ t.pwa.filters }}</h2>
        <input v-model="search" class="filters__search" type="search" :placeholder="t.pwa.search_unit" :aria-label="t.pwa.search_unit" />
      </header>
      <div class="filters__body">
        <div class="filters__group">
          <span id="type-filter-label" class="filters__label">{{ t.pwa.filter_type }}</span>
          <div class="tabs" role="tablist" aria-labelledby="type-filter-label">
            <button
              v-for="(type, index) in UNIT_TYPES"
              :key="type"
              type="button"
              role="tab"
              :aria-selected="activeType === type"
              @click="activeType = type"
            >
              {{ typeLabel(index) }} <span class="muted small">({{ byType[type].length }})</span>
            </button>
          </div>
        </div>
        <div class="filters__group" role="group" aria-labelledby="tier-filter-label">
          <span id="tier-filter-label" class="filters__label">{{ t.pwa.filter_tier }}</span>
          <div class="tabs">
            <label v-for="tier in TIER_FILTERS" :key="tier" class="chip">
              <input v-model="tierFilter" type="checkbox" :value="tier" />
              <span>{{ tier }}</span>
            </label>
          </div>
        </div>
        <label class="switch filters__unlocked">
          <input v-model="onlyUnlocked" type="checkbox" />
          <span class="switch__track" />
          <span>{{ t.pwa.only_unlocked }}</span>
        </label>
      </div>
    </section>

    <div class="grid units" style="--min: 320px">
      <article v-for="unit in visibleUnits" :key="unit.Unit_id" class="unit" :class="lvlClass(unit)">
        <img class="unit__img" :src="assetUrl(unit.Unit_img)" :alt="tr(unit.Unit_name)" loading="lazy" @error="onImgError($event, logo)" />
        <div class="unit__body">
          <h3 class="unit__name">{{ tr(unit.Unit_name) }}</h3>
          <p class="muted small">{{ t.caserne.influence }} : {{ unit.Unit_influence }} · {{ unit.Unit_tier }}</p>

          <select v-model="state[unit.Unit_id].lvl" class="unit__lvl" :aria-label="`${t.caserne.level} ${tr(unit.Unit_name)}`">
            <option value="">
              {{ unit.Unit_lvl !== "0" ? `${t.caserne.level} ${unit.Unit_lvl}` : t.caserne.nodata }}
            </option>
            <option v-if="unit.Unit_lvl !== '0'" value="-1">{{ t.caserne.nodata }}</option>
            <option v-for="level in levelOptions(unit)" :key="level" :value="String(level)">{{ t.caserne.level }} {{ level }}</option>
          </select>

          <select
            v-if="unit.Unit_maitrise === '1' && effectiveLvl(unit) > 0"
            v-model="state[unit.Unit_id].maitrise"
            class="unit__mastery"
            :style="{ '--mastery': masteryColor(state[unit.Unit_id].maitrise) }"
          >
            <option v-for="[value, label] in masteryOptions" :key="value" :value="value">{{ label }}</option>
          </select>

          <label v-if="effectiveLvl(unit) > 0" class="switch">
            <input v-model="state[unit.Unit_id].doctrine" type="checkbox" />
            <span class="switch__track" />
            <span class="small">{{ t.pwa.doctrine }}</span>
          </label>
        </div>
      </article>
      <p v-if="visibleUnits.length === 0" class="muted">{{ t.pwa.no_result }}</p>
    </div>

    <div class="savebar" :class="{ 'savebar--dirty': dirtyCount > 0 }">
      <span v-if="dirtyCount > 0">{{ t.pwa.unsaved }} : {{ dirtyCount }}</span>
      <span v-else class="muted small">{{ t.caserne.avertissement }}</span>
      <button type="button" class="btn btn--primary" :disabled="busy" @click="save">{{ saveLabel }}</button>
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px;
}
.filters__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.filters__title {
  margin: 0;
  font-size: 1.25rem;
}
.filters__search {
  width: 280px;
  max-width: 100%;
  padding-left: 36px;
  background: rgba(10, 8, 6, 0.65)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='7' cy='7' r='4.5' fill='none' stroke='%23b5a993' stroke-width='1.6'/%3E%3Cpath d='M10.5 10.5L14 14' stroke='%23b5a993' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E")
    12px center / 16px no-repeat;
}
.filters__body {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px 32px;
}
.filters__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 100%;
}
.filters__label {
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
/* Même hauteur que les groupes de boutons, pour rester aligné sur leur ligne */
.filters__unlocked {
  min-height: 46px;
  font-weight: 600;
}
/* Tier : cases à cocher présentées comme les onglets, coche visible quand actif (pas seulement la couleur) */
.chip {
  position: relative;
}
.chip input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.chip span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  color: var(--muted);
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}
.chip input:checked + span {
  background: var(--accent);
  color: #1b160f;
}
.chip input:checked + span::before {
  content: "";
  width: 12px;
  height: 12px;
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M1.5 5.2l2.3 2.3 4.7-5' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M1.5 5.2l2.3 2.3 4.7-5' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
}
.chip input:focus-visible + span {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}
/* Petit écran : les 3 types se partagent la largeur, le nombre d'unités passe sous le nom */
@media (max-width: 640px) {
  .filters__group:first-child {
    width: 100%;
  }
  .filters__group:first-child .tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
    border-radius: var(--radius);
  }
  .filters__group:first-child .tabs button {
    padding: 8px 4px;
    border-radius: var(--radius-sm);
    line-height: 1.2;
  }
  .filters__group:first-child .tabs button .small {
    display: block;
  }
}
.unit {
  display: flex;
  align-items: stretch;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: 4px solid var(--danger);
}
.unit.lvl--partial {
  border-top-color: var(--warning);
}
.unit.lvl--max {
  border-top-color: var(--success);
}
/* Cartes d'unité verticales (160x230) : affichées entières, sans recadrage */
.unit__img {
  flex: 0 0 104px;
  width: 104px;
  aspect-ratio: 160 / 230;
  align-self: flex-start;
  object-fit: contain;
  background: var(--surface-2);
}
.unit.lvl--none .unit__img {
  filter: grayscale(0.85) brightness(0.7);
}
.unit__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
}
.unit__name {
  margin: 0;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
}
.unit__body p {
  margin: 0;
}
.lvl--none .unit__lvl {
  border-color: var(--danger);
}
.lvl--partial .unit__lvl {
  border-color: var(--warning);
}
.lvl--max .unit__lvl {
  border-color: var(--success);
}
.unit__mastery {
  border-color: var(--mastery);
  box-shadow: inset 4px 0 0 var(--mastery);
}
.savebar {
  position: sticky;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
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
</style>
