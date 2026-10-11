<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { usePage } from "../api/usePage";
import type { SettingBot } from "../api/types";
import { t } from "../i18n";
import { confirmDialog } from "../stores/confirm";
import { showToast } from "../stores/toast";

const { data, loading, busy, submit } = usePage("settingbot", "officier");

const TEXT_FIELDS = ["House_name", "Langage"] as const;
const ID_FIELDS = ["ID_Chan_GvG", "ID_Chan_Users", "ID_Chan_Gestion", "ID_Group_Users", "ID_Group_Officier"] as const;

type TextField = (typeof TEXT_FIELDS)[number] | (typeof ID_FIELDS)[number];

const form = reactive({
  House_name: "",
  Langage: "",
  ID_Chan_GvG: "",
  ID_Chan_Users: "",
  ID_Chan_Gestion: "",
  ID_Group_Users: "",
  ID_Group_Officier: "",
  late: false,
  recall: false,
  votes: false,
});

const ts = computed(() => t.value.settingbot);
const origin = computed<SettingBot | null>(() => data.value?.Settingbot ?? null);

// Late / Recall_GvG : 1 = activé ; Allumage : 0 = votes activés
watch(origin, (setting) => {
  if (!setting) return;
  for (const field of [...TEXT_FIELDS, ...ID_FIELDS]) form[field] = setting[field] ?? "";
  form.late = setting.Late === 1;
  form.recall = setting.Recall_GvG === 1;
  form.votes = setting.Allumage === 0;
});

const isDiscordId = (value: string) => /^\d{17,19}$/.test(value);
const invalidIds = computed(() => ID_FIELDS.filter((field) => form[field].trim() !== "" && !isDiscordId(form[field].trim())));

function changes(): Record<string, string | number> {
  const setting = origin.value;
  if (!setting) return {};
  const result: Record<string, string | number> = {};
  for (const field of [...TEXT_FIELDS, ...ID_FIELDS] as TextField[]) {
    const value = form[field].trim();
    if (value !== "" && value !== (setting[field] ?? "")) result[field] = value;
  }
  const late = form.late ? 1 : 0;
  const recall = form.recall ? 1 : 0;
  const allumage = form.votes ? 0 : 1;
  if (late !== (setting.Late ?? 0)) result.Late = late;
  if (recall !== (setting.Recall_GvG ?? 0)) result.Recall_GvG = recall;
  if (allumage !== (setting.Allumage ?? 1)) result.Allumage = allumage;
  return result;
}

async function save() {
  if (invalidIds.value.length) return showToast(ts.value.notif.idDiscord, "error");
  const payload = changes();
  if (Object.keys(payload).length === 0) return showToast(ts.value.notif.empty, "error");
  if (await confirmDialog(ts.value.confirm)) submit("updatesettingbot", payload);
}
</script>

<template>
  <div v-if="loading && !data" class="spinner" role="status" />

  <form v-else-if="data" class="card stack settings" @submit.prevent="save">
    <div class="card__title">
      <h1>{{ t.home.settingbot }}</h1>
      <img v-if="origin?.House_logo" :src="origin.House_logo" alt="" class="logo" />
    </div>

    <div class="form-grid">
      <label class="field">
        <span>{{ ts.name }}</span>
        <input v-model="form.House_name" type="text" maxlength="60" />
      </label>
      <label class="field">
        <span>{{ ts.Langage }}</span>
        <select v-model="form.Langage">
          <option v-for="[code, label] in Object.values(t.commun.Langage)" :key="code" :value="code">{{ label }}</option>
        </select>
      </label>
    </div>

    <hr />
    <p class="muted small">
      {{ ts.tutoID }}
      <a href="https://www.youtube.com/watch?v=KVLdpboY7bg" target="_blank" rel="noopener">youtube.com/watch?v=KVLdpboY7bg</a>
    </p>

    <div class="form-grid">
      <label v-for="field in ID_FIELDS" :key="field" class="field">
        <span>{{ ts[field] }}</span>
        <input
          v-model="form[field]"
          type="text"
          inputmode="numeric"
          pattern="\d{17,19}"
          :aria-invalid="invalidIds.includes(field)"
          :class="{ invalid: invalidIds.includes(field) }"
        />
      </label>
    </div>

    <hr />

    <div class="toggles">
      <div class="toggle">
        <label class="switch">
          <input v-model="form.votes" type="checkbox" />
          <span class="switch__track" />
          <strong>{{ ts.Allumage }}</strong>
        </label>
        <p class="muted small">{{ ts.explainAllumage }}</p>
      </div>
      <div class="toggle">
        <label class="switch">
          <input v-model="form.late" type="checkbox" />
          <span class="switch__track" />
          <strong>{{ ts.Late }}</strong>
        </label>
        <p class="muted small">{{ ts.explainLate }}</p>
      </div>
      <div class="toggle">
        <label class="switch">
          <input v-model="form.recall" type="checkbox" />
          <span class="switch__track" />
          <strong>{{ ts.Recall_GvG }}</strong>
        </label>
        <p class="muted small">{{ ts.explainRecall_GvG }}</p>
      </div>
    </div>

    <div class="row row--end">
      <button type="submit" class="btn btn--primary" :disabled="busy">{{ ts.updateButton }}</button>
    </div>
  </form>
</template>

<style scoped>
.settings {
  max-width: 900px;
  margin: 0 auto;
}
.logo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}
hr {
  width: 100%;
  border: none;
  border-top: 1px solid var(--border);
}
.invalid {
  border-color: var(--danger);
}
.toggles {
  display: grid;
  gap: 14px;
}
.toggle p {
  margin: 4px 0 0 48px;
}
</style>
