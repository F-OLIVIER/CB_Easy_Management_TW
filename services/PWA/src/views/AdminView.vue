<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { usePage } from "../api/usePage";
import type { ApiResponse, Unit } from "../api/types";
import { lang, t, tr } from "../i18n";
import { confirmDialog } from "../stores/confirm";
import { showToast } from "../stores/toast";
import { stripTags } from "../utils/format";
import { groupUnits, onWeaponError, TIERS, weaponImg, weaponImgVersion } from "../utils/units";

const { data, loading, busy, submit } = usePage("CheckAppAdmin", "admin");

const ta = computed(() => t.value.pwa.admin);
/** Statistiques, info Discord et DM ne sont renvoyés qu'au propriétaire (OWNER) */
const isOwner = computed(() => Boolean(data.value?.Statistique?.Houses));
const unitTypes = computed(() => data.value?.Gestion.ListUnitType ?? []);
const unitGroups = computed(() => groupUnits(data.value?.ListUnit ?? [], data.value?.Gestion.ListUnitType ?? null, lang.value));

const VALID_FILENAME = /^[a-zA-Z0-9_.-]+$/;
const isSuccess = (response: ApiResponse | null) => response && response.Gestion.Notification.Type !== "error";

function checkImage(file: File | null, required: boolean): boolean {
  if (!file) {
    if (required) showToast(ta.value.err_fields, "error");
    return !required;
  }
  if (!VALID_FILENAME.test(file.name)) {
    showToast(ta.value.err_filename, "error");
    return false;
  }
  return true;
}

function fileOf(event: Event): File | null {
  return (event.target as HTMLInputElement).files?.[0] ?? null;
}

function sendForm(payload: object, image: File | null) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  if (image) formData.append("image", image);
  return submit("adminitrateBot", formData);
}

// ---------------------------- Nouvelle unité ------------------------------
const newUnit = reactive({ nameEn: "", nameFr: "", influence: "", lvlMax: "", tier: "", type: "", mastery: "0", image: null as File | null });
const newUnitInput = ref<HTMLInputElement | null>(null);

async function createUnit() {
  const { nameEn, nameFr, influence, lvlMax, tier, type, mastery, image } = newUnit;
  if (![nameEn, nameFr, influence, lvlMax, tier, type].every((value) => String(value).trim())) return showToast(ta.value.err_fields, "error");
  if (Number(influence) < 0 || Number(influence) > 500) return showToast(ta.value.err_influence, "error");
  if (Number(lvlMax) < 0 || Number(lvlMax) > 50) return showToast(ta.value.err_lvl, "error");
  if (!checkImage(image, true)) return;
  if (!(await confirmDialog(ta.value.confirm_new_unit))) return;

  const response = await sendForm(
    {
      createUnit: {
        Unit_name: { en: stripTags(nameEn.trim()), fr: stripTags(nameFr.trim()) },
        Unit_influence: String(influence),
        Unit_lvlMax: String(lvlMax),
        Unit_tier: tier,
        Unit_type: { fr: type },
        Unit_maitrise: mastery,
      },
    },
    image,
  );
  if (isSuccess(response)) {
    Object.assign(newUnit, { nameEn: "", nameFr: "", influence: "", lvlMax: "", tier: "", type: "", mastery: "0", image: null });
    if (newUnitInput.value) newUnitInput.value.value = "";
  }
}

// --------------------------- Modifier une unité ---------------------------
const editId = ref("");
const edit = reactive({ nameEn: "", nameFr: "", influence: "", lvlMax: "", tier: "", type: "", addMastery: false, image: null as File | null });
const editUnit = computed<Unit | null>(() => data.value?.ListUnit?.find((unit) => unit.Unit_id === editId.value) ?? null);
const editInput = ref<HTMLInputElement | null>(null);

watch(editId, () => {
  Object.assign(edit, { nameEn: "", nameFr: "", influence: "", lvlMax: "", tier: "", type: "", addMastery: false, image: null });
  if (editInput.value) editInput.value.value = "";
});

async function updateUnit() {
  const unit = editUnit.value;
  if (!unit) return;
  const { nameEn, nameFr, influence, lvlMax, tier, type, addMastery, image } = edit;
  if (influence !== "" && (Number(influence) < 0 || Number(influence) > 500)) return showToast(ta.value.err_influence, "error");
  if (lvlMax !== "" && (Number(lvlMax) < 0 || Number(lvlMax) > 50)) return showToast(ta.value.err_lvl, "error");
  const hasChange = [nameEn, nameFr, influence, lvlMax, tier, type].some((value) => String(value).trim()) || addMastery;
  if (!hasChange && !image) return showToast(ta.value.err_nochange, "error");
  if (!checkImage(image, false)) return;
  if (!(await confirmDialog(`${ta.value.confirm_edit_unit} "${tr(unit.Unit_name)}" ?`))) return;

  const response = await sendForm(
    {
      changeUnit: {
        Unit_name: { fr: unit.Unit_name.fr },
        New_unit_name: { en: stripTags(nameEn.trim()), fr: stripTags(nameFr.trim()) },
        Unit_tier: tier,
        Unit_type: { fr: type },
        Unit_influence: String(influence),
        Unit_lvlMax: String(lvlMax),
        Unit_maitrise: addMastery ? "1" : "",
      },
    },
    image,
  );
  if (isSuccess(response)) editId.value = "";
}

// ------------------------ Arme / messages Discord -------------------------
const weapon = reactive({ en: "", fr: "" });
const info = reactive({ en: "", fr: "" });
const dm = reactive({ userId: "", message: "" });

async function sendAdmin(payload: object, confirmMessage: string): Promise<boolean> {
  if (!(await confirmDialog(confirmMessage))) return false;
  return Boolean(isSuccess(await submit("UpdateAdmin", payload)));
}

// ---------------------------- Image d'une arme ----------------------------
const MAX_WEAPON_IMG_SIZE = 2 * 1024 * 1024;
const weaponImgForm = reactive({ weapon: "", image: null as File | null });
const weaponImgInput = ref<HTMLInputElement | null>(null);
const weapons = computed(() => data.value?.Gestion.ListClass ?? []);
/** Aperçu local du fichier choisi, avant envoi */
const weaponPreview = ref("");

watch(
  () => weaponImgForm.image,
  (file) => {
    if (weaponPreview.value) URL.revokeObjectURL(weaponPreview.value);
    weaponPreview.value = file ? URL.createObjectURL(file) : "";
  },
);

async function updateWeaponImage() {
  const weapon = weapons.value.find((item) => item.fr === weaponImgForm.weapon);
  const image = weaponImgForm.image;
  if (!weapon || !image) return showToast(ta.value.err_fields, "error");
  if (image.size > MAX_WEAPON_IMG_SIZE) return showToast(ta.value.err_weapon_size, "error");
  if (!(await confirmDialog(`${ta.value.confirm_weapon_img} "${weapon[lang.value]}" ?`))) return;

  // Le nom du fichier envoyé est ignoré : le serveur enregistre <nom FR de l'arme>.png
  const response = await sendForm({ changeWeapon: { fr: weapon.fr } }, image);
  if (isSuccess(response)) {
    weaponImgVersion.value = Date.now();
    weaponImgForm.image = null;
    if (weaponImgInput.value) weaponImgInput.value.value = "";
  }
}

async function addWeapon() {
  if (!weapon.en.trim() || !weapon.fr.trim()) return showToast(ta.value.err_fields, "error");
  const ok = await sendAdmin({ newWeapon: { en: weapon.en.trim(), fr: weapon.fr.trim() }, informationDiscord: false }, `${ta.value.confirm_weapon} "${weapon.en.trim()}" ?`);
  if (ok) Object.assign(weapon, { en: "", fr: "" });
}

async function sendInfo() {
  if (!info.en.trim() || !info.fr.trim()) return showToast(ta.value.err_fields, "error");
  const ok = await sendAdmin({ newWeapon: { en: info.en.trim(), fr: info.fr.trim() }, informationDiscord: true }, ta.value.confirm_info);
  if (ok) Object.assign(info, { en: "", fr: "" });
}

async function sendDm() {
  if (!dm.userId.trim() || !dm.message.trim()) return showToast(ta.value.err_fields, "error");
  const ok = await sendAdmin({ newWeapon: { en: dm.userId.trim(), fr: dm.message.trim() }, dmDiscord: true }, ta.value.confirm_dm);
  if (ok) Object.assign(dm, { userId: "", message: "" });
}
</script>

<template>
  <div v-if="loading && !data" class="spinner" role="status" />

  <div v-else-if="data" class="stack">
    <h1>{{ t.home.admin }}</h1>

    <!-- Statistiques (propriétaire) -->
    <section v-if="isOwner" class="card stack">
      <div class="card__title">
        <h2>{{ ta.stats_title }}</h2>
        <span class="badge">{{ ta.tables }} : {{ data.Statistique.Nb_Table }}</span>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ ta.house }}</th>
              <th>{{ ta.users }}</th>
              <th>{{ ta.language }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="house in data.Statistique.Houses ?? []" :key="house.ID + house.House_name">
              <td>{{ house.House_name }}</td>
              <td>{{ house.Discord }}</td>
              <td>{{ house.Language }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="grid" style="--min: 380px">
      <!-- Nouvelle unité -->
      <form class="card stack" @submit.prevent="createUnit">
        <h2>{{ ta.new_unit }}</h2>
        <div class="form-grid">
          <label class="field"><span>{{ ta.name_en }}</span><input v-model="newUnit.nameEn" type="text" required /></label>
          <label class="field"><span>{{ ta.name_fr }}</span><input v-model="newUnit.nameFr" type="text" required /></label>
          <label class="field"><span>{{ ta.influence }}</span><input v-model="newUnit.influence" type="number" min="0" max="500" required /></label>
          <label class="field"><span>{{ ta.lvl_max }}</span><input v-model="newUnit.lvlMax" type="number" min="0" max="50" required /></label>
          <label class="field">
            <span>{{ ta.tier }}</span>
            <select v-model="newUnit.tier" required>
              <option value="" disabled>—</option>
              <option v-for="tier in [...TIERS].reverse()" :key="tier" :value="tier">{{ tier }}</option>
            </select>
          </label>
          <label class="field">
            <span>{{ ta.type }}</span>
            <select v-model="newUnit.type" required>
              <option value="" disabled>—</option>
              <option v-for="type in unitTypes" :key="type.fr" :value="type.fr">{{ type[lang] }}</option>
            </select>
          </label>
        </div>
        <fieldset class="row">
          <legend class="muted small">{{ ta.mastery }}</legend>
          <label class="row"><input v-model="newUnit.mastery" type="radio" value="1" /> {{ ta.mastery_yes }}</label>
          <label class="row"><input v-model="newUnit.mastery" type="radio" value="0" /> {{ ta.mastery_no }}</label>
        </fieldset>
        <label class="field">
          <span>{{ ta.image }}</span>
          <input ref="newUnitInput" type="file" accept=".jpg,.jpeg,.png" required @change="newUnit.image = fileOf($event)" />
        </label>
        <button type="submit" class="btn btn--primary" :disabled="busy">{{ ta.add_unit }}</button>
      </form>

      <!-- Modifier une unité -->
      <form class="card stack" @submit.prevent="updateUnit">
        <h2>{{ ta.edit_unit }}</h2>
        <select v-model="editId">
          <option value="">{{ ta.select_unit }}</option>
          <optgroup v-for="group in unitGroups" :key="group.key" :label="group.label">
            <option v-for="unit in group.units" :key="unit.Unit_id" :value="unit.Unit_id">{{ unit.Unit_name.fr }} / {{ unit.Unit_name.en }}</option>
          </optgroup>
        </select>
        <template v-if="editUnit">
          <div class="form-grid">
            <label class="field"><span>{{ ta.name_en }}</span><input v-model="edit.nameEn" type="text" :placeholder="editUnit.Unit_name.en" /></label>
            <label class="field"><span>{{ ta.name_fr }}</span><input v-model="edit.nameFr" type="text" :placeholder="editUnit.Unit_name.fr" /></label>
            <label class="field">
              <span>{{ ta.influence }}</span>
              <input v-model="edit.influence" type="number" min="0" max="500" :placeholder="editUnit.Unit_influence" />
            </label>
            <label class="field">
              <span>{{ ta.lvl_max }}</span>
              <input v-model="edit.lvlMax" type="number" min="0" max="50" :placeholder="editUnit.Unit_lvlMax" />
            </label>
            <label class="field">
              <span>{{ ta.tier }}</span>
              <select v-model="edit.tier">
                <option value="">{{ ta.current }} : {{ editUnit.Unit_tier }}</option>
                <option v-for="tier in TIERS.filter((tier) => tier !== editUnit?.Unit_tier)" :key="tier" :value="tier">{{ tier }}</option>
              </select>
            </label>
            <label class="field">
              <span>{{ ta.type }}</span>
              <select v-model="edit.type">
                <option value="">{{ ta.current }} : {{ tr(editUnit.Unit_type) }}</option>
                <option v-for="type in unitTypes.filter((type) => type.fr !== editUnit?.Unit_type.fr)" :key="type.fr" :value="type.fr">{{ type[lang] }}</option>
              </select>
            </label>
          </div>
          <label v-if="editUnit.Unit_maitrise === '0'" class="switch">
            <input v-model="edit.addMastery" type="checkbox" />
            <span class="switch__track" />
            <span>{{ ta.add_mastery }}</span>
          </label>
          <label class="field">
            <span>{{ ta.image }}</span>
            <input ref="editInput" type="file" accept=".jpg,.jpeg,.png" @change="edit.image = fileOf($event)" />
          </label>
          <button type="submit" class="btn btn--primary" :disabled="busy">{{ ta.edit_unit_btn }}</button>
        </template>
      </form>

      <!-- Nouvelle arme -->
      <form class="card stack" @submit.prevent="addWeapon">
        <h2>{{ ta.new_weapon }}</h2>
        <label class="field"><span>{{ ta.name_en }}</span><input v-model="weapon.en" type="text" required /></label>
        <label class="field"><span>{{ ta.name_fr }}</span><input v-model="weapon.fr" type="text" required /></label>
        <button type="submit" class="btn btn--primary" :disabled="busy">{{ ta.add_weapon }}</button>
      </form>

      <!-- Image d'une arme -->
      <form class="card stack" @submit.prevent="updateWeaponImage">
        <h2>{{ ta.weapon_img }}</h2>
        <select v-model="weaponImgForm.weapon" required>
          <option value="">{{ ta.weapon_select }}</option>
          <option v-for="item in weapons" :key="item.fr" :value="item.fr">{{ item[lang] }}</option>
        </select>
        <div v-if="weaponImgForm.weapon" class="weapon-preview">
          <figure>
            <img :src="weaponImg(weaponImgForm.weapon)" alt="" @error="onWeaponError" />
            <figcaption class="muted small">{{ ta.current }}</figcaption>
          </figure>
          <figure v-if="weaponPreview">
            <img :src="weaponPreview" alt="" />
            <figcaption class="muted small">{{ ta.weapon_new }}</figcaption>
          </figure>
        </div>
        <label class="field">
          <span>{{ ta.weapon_file }}</span>
          <input ref="weaponImgInput" type="file" accept=".png,.jpg,.jpeg,.gif" required @change="weaponImgForm.image = fileOf($event)" />
        </label>
        <button type="submit" class="btn btn--primary" :disabled="busy">{{ ta.weapon_img_btn }}</button>
      </form>

      <template v-if="isOwner">
        <!-- Information Discord à toutes les maisons -->
        <form class="card stack" @submit.prevent="sendInfo">
          <h2>{{ ta.info_discord }}</h2>
          <label class="field"><span>{{ ta.info_en }}</span><textarea v-model="info.en" required /></label>
          <label class="field"><span>{{ ta.info_fr }}</span><textarea v-model="info.fr" required /></label>
          <button type="submit" class="btn btn--primary" :disabled="busy">{{ ta.send_info }}</button>
        </form>

        <!-- Message privé Discord -->
        <form class="card stack" @submit.prevent="sendDm">
          <h2>{{ ta.dm_discord }}</h2>
          <label class="field"><span>{{ ta.dm_user }}</span><input v-model="dm.userId" type="text" inputmode="numeric" required /></label>
          <label class="field"><span>{{ ta.dm_msg }}</span><textarea v-model="dm.message" required /></label>
          <button type="submit" class="btn btn--primary" :disabled="busy">{{ ta.send_dm }}</button>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.weapon-preview {
  display: flex;
  gap: 16px;
}
.weapon-preview figure {
  margin: 0;
  text-align: center;
}
.weapon-preview img {
  width: 72px;
  height: 72px;
  object-fit: contain;
  padding: 6px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
}
fieldset {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  gap: 16px;
}
fieldset label {
  gap: 6px;
}
</style>
