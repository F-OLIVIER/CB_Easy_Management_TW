<script setup lang="ts">
import { computed, ref } from "vue";
import BarracksEditor from "../components/BarracksEditor.vue";
import type { BarracksPayload } from "../utils/units";
import { usePage } from "../api/usePage";
import { t } from "../i18n";

const { data, loading, busy, submit } = usePage("consulcaserne", "officier");

const selectedId = ref("");

const players = computed(() => [...(data.value?.ListInscripted ?? [])].sort((a, b) => a.Username.localeCompare(b.Username)));
const selected = computed(() => players.value.find((player) => String(player.ID) === selectedId.value) ?? null);

function save(payload: BarracksPayload) {
  if (!selected.value) return;
  submit("majspecificcaserne", { iduser: String(selected.value.ID), listNewLvlUnitCaserne: payload });
}
</script>

<template>
  <div v-if="loading && !data" class="spinner" role="status" />
  <div v-else-if="data" class="stack">
    <h1>{{ t.home.caserne_other }}</h1>
    <label class="field card">
      <span>{{ t.caserne.consulcaserne }}</span>
      <select v-model="selectedId">
        <option value="">{{ t.caserne.select }}</option>
        <option v-for="player in players" :key="player.ID" :value="String(player.ID)">{{ player.Username }}</option>
      </select>
    </label>

    <BarracksEditor
      v-if="selected"
      :key="selected.ID"
      :units="selected.UserCaserne ?? []"
      :unit-types="data.Gestion.ListUnitType"
      :busy="busy"
      :save-label="t.caserne.buttonconsul"
      @save="save"
    />
  </div>
</template>
