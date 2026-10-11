<script setup lang="ts">
import { computed, reactive } from "vue";
import { usePage } from "../api/usePage";
import { lang, t, tr } from "../i18n";
import { currentHouse } from "../stores/session";
import { showToast } from "../stores/toast";
import { onWeaponError, weaponImg } from "../utils/units";

const { data, loading, busy, submit } = usePage("charactercard");

const form = reactive({ classe: "", lvl: "", influence: "" });

const user = computed(() => data.value?.UserInfo);
const tc = computed(() => t.value.characterCard);
const lateEnabled = computed(() => currentHouse.value?.Late === 1);

const STATES = { NONE: 0, PRESENT: 1, LATE: 2, ABSENT: 3 } as const;

const inscriptionLabel = computed(() => {
  const labels = tc.value.info_GvG.inscripted;
  switch (user.value?.EtatInscription) {
    case STATES.PRESENT:
      return labels.present;
    case STATES.LATE:
      return labels.late;
    case STATES.ABSENT:
      return labels.absent;
    default:
      return labels.nodata;
  }
});

/** Boutons d'inscription disponibles selon l'état actuel */
const inscriptionButtons = computed(() => {
  const state = user.value?.EtatInscription ?? STATES.NONE;
  const labels = tc.value.info_GvG.button;
  return [
    { value: STATES.PRESENT, label: labels.present, cls: "btn--success", show: state !== STATES.PRESENT },
    { value: STATES.LATE, label: labels.late, cls: "btn--warning", show: lateEnabled.value && state !== STATES.LATE },
    { value: STATES.ABSENT, label: labels.absent, cls: "btn--danger", show: state !== STATES.ABSENT },
  ].filter((button) => button.show);
});

const lastGvG = computed(() => {
  const date = tr(user.value?.DateLastGvG);
  return date || tc.value.info_GvG.lastGvG.nodata;
});

async function updateCharacter() {
  const { lvl, influence, classe } = form;
  const errors = tc.value.error;
  if (lvl !== "" && (Number(lvl) > 10000 || Number(lvl) < 0)) return showToast(errors.err_lvl, "error");
  if (influence !== "" && (Number(influence) > 1200 || Number(influence) < 700)) return showToast(errors.err_influ, "error");
  if (lvl === "" && influence === "" && classe === "") return showToast(errors.err_select, "error");

  // Le backend attend des chaînes pour Lvl et Influence
  const response = await submit("updateCharacterCard", {
    GameCharacter: { fr: classe },
    Lvl: String(lvl),
    Influence: String(influence),
  });
  if (response) Object.assign(form, { classe: "", lvl: "", influence: "" });
}

function setInscription(state: number) {
  submit("updateCharacterCard", { EtatInscription: state });
}
</script>

<template>
  <div v-if="loading && !data" class="spinner" role="status" />

  <div v-else-if="data && user" class="grid" style="--min: 340px">
    <section class="card">
      <div class="card__title">
        <h2>{{ tc.info_user.title }}</h2>
        <img class="weapon" :src="weaponImg(user.GameCharacter.fr)" :alt="tr(user.GameCharacter)" @error="onWeaponError" />
      </div>

      <dl class="facts">
        <div>
          <dt>{{ tc.info_user.classe.get }}</dt>
          <dd>{{ tr(user.GameCharacter) || "—" }}</dd>
        </div>
        <div>
          <dt>{{ tc.info_user.level.get }}</dt>
          <dd>{{ user.Lvl && user.Lvl !== "0" ? user.Lvl : tc.info_user.level.nodata }}</dd>
        </div>
        <div>
          <dt>{{ tc.info_user.influence.get }}</dt>
          <dd>{{ user.Influence }}</dd>
        </div>
      </dl>

      <form class="stack" @submit.prevent="updateCharacter">
        <label class="field">
          <span>{{ tc.info_user.classe.set }}</span>
          <select v-model="form.classe">
            <option value="">{{ tc.info_user.classe.new }}</option>
            <option v-for="classe in data.Gestion.ListClass ?? []" :key="classe.fr" :value="classe.fr">{{ classe[lang] }}</option>
          </select>
        </label>
        <div class="form-grid">
          <label class="field">
            <span>{{ tc.info_user.level.set }}</span>
            <input v-model="form.lvl" type="number" min="0" max="10000" inputmode="numeric" :placeholder="tc.info_user.level.new" />
          </label>
          <label class="field">
            <span>{{ tc.info_user.influence.set }}</span>
            <input v-model="form.influence" type="number" min="700" max="1200" inputmode="numeric" :placeholder="tc.info_user.influence.new" />
          </label>
        </div>
        <button type="submit" class="btn btn--primary" :disabled="busy">{{ tc.info_user.button }}</button>
      </form>
    </section>

    <section class="card">
      <h2>{{ tc.info_GvG.title }}</h2>

      <template v-if="data.Gestion.BotActivate">
        <p class="inscription">{{ inscriptionLabel }}</p>
        <div class="row">
          <button
            v-for="button in inscriptionButtons"
            :key="button.value"
            type="button"
            class="btn"
            :class="button.cls"
            :disabled="busy"
            @click="setInscription(button.value)"
          >
            {{ button.label }}
          </button>
        </div>
      </template>
      <p v-else class="alert">{{ tc.info_GvG.noinscription }}</p>

      <dl class="facts facts--gvg">
        <div>
          <dt>{{ tc.info_GvG.nbGvG }}</dt>
          <dd>{{ user.NbGvGParticiped }}</dd>
        </div>
        <div>
          <dt>{{ tc.info_GvG.lastGvG.description }}</dt>
          <dd>{{ lastGvG }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.weapon {
  width: 56px;
  height: 56px;
  object-fit: contain;
}
.facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin: 0 0 20px;
}
.facts div {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.facts dt {
  font-size: 0.8rem;
  color: var(--muted);
}
.facts dd {
  margin: 2px 0 0;
  font-size: 1.15rem;
  font-weight: 600;
}
.facts--gvg {
  margin-top: 20px;
}
.inscription {
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
