<script setup lang="ts">
import BarracksEditor from "../components/BarracksEditor.vue";
import type { BarracksPayload } from "../utils/units";
import { usePage } from "../api/usePage";
import { t } from "../i18n";

const { data, loading, busy, submit } = usePage("caserne");

function save(payload: BarracksPayload) {
  submit("majcaserne", { listNewLvlUnitCaserne: payload });
}
</script>

<template>
  <div v-if="loading && !data" class="spinner" role="status" />
  <div v-else-if="data" class="stack">
    <h1>{{ t.home.caserne }}</h1>
    <BarracksEditor
      :units="data.ListUnit ?? []"
      :unit-types="data.Gestion.ListUnitType"
      :busy="busy"
      :save-label="t.caserne.button"
      @save="save"
    />
  </div>
</template>
