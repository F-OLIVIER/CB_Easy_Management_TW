// Types des réponses du backend Go (services/site/internal/datastruct.go).
// Les noms de champs correspondent aux tags JSON côté Go.

export type Lang = "fr" | "en";

export interface I18nText {
  fr: string;
  en: string;
}

export interface Notif {
  Notif: boolean;
  Type: "success" | "error" | string;
  content: I18nText;
}

export interface Gestion {
  Logged: boolean;
  MsgErr: string;
  Notification: Notif;
  Redirect: string;
  Officier: boolean;
  Admin: boolean;
  BotActivate: boolean;
  ListClass: I18nText[] | null;
  ListUnitType: I18nText[] | null;
  CodeApp: string;
  Valid: boolean;
}

export interface Unit {
  Unit_id: string;
  Unit_img: string;
  Unit_influence: string;
  Unit_lvl: string;
  Unit_lvlMax: string;
  Unit_name: I18nText;
  Unit_type: I18nText;
  Unit_tier: string;
  /** "1" si l'unité possède une maîtrise */
  Unit_maitrise: string;
  /** "0" non démarrée, "1" en cours, "2" complète, "" jamais saisie */
  UserMaitrise: string;
  DoctrineInflu: boolean;
  New_unit_name: I18nText;
}

export interface UserInfo {
  Username: string;
  Photo: string;
  ID: number;
  /** 0/-1 non inscrit, 1 présent, 2 en retard, 3 absent */
  EtatInscription: number;
  GameCharacter_ID: number;
  GameCharacter: I18nText;
  Lvl: string;
  Influence: string;
  NbTotalGvG: string;
  NbGvGParticiped: string;
  DateLastGvG: I18nText;
  UserCaserne: Unit[] | null;
  ConnectedSite: string;
  ListDateGvG: string[][] | null;
  CommentGestionnaire: string;
  ID_House: number;
  Discord: string;
  Language: string;
  CodeApp: string;
}

export interface UserGvG {
  User_ID: number;
  Username: string;
  GroupNumber: number;
  Unit1: string;
  Unit2: string;
  Unit3: string;
  Unit4: string;
  commentaire: string;
  Late: boolean;
}

export interface House {
  ID: string;
  House_name: string;
  House_logo: string;
  Language: string;
  /** ID du serveur Discord (sert d'identifiant de maison côté front) */
  Discord: string;
  Late: number;
}

export interface Statistique {
  Houses: House[] | null;
  Nb_Table: string;
  List: UserInfo[] | null;
}

export interface Post {
  ID: string;
  Title: string;
  Date: string;
  Author: string;
  Content: string;
  Valid: boolean;
  Archive: boolean;
  Comments: Post[] | null;
}

export interface SettingBot {
  House_name: string | null;
  House_logo: string | null;
  Langage: string | null;
  ID_Group_Users: string | null;
  ID_Group_Officier: string | null;
  ID_Chan_GvG: string | null;
  ID_Chan_Gestion: string | null;
  ID_Chan_Users: string | null;
  Late: number | null;
  Recall_GvG: number | null;
  Allumage: number | null;
}

/** Réponse commune à toutes les routes /api/* */
export interface ApiResponse {
  UserInfo: UserInfo;
  ListUnit: Unit[] | null;
  Gestion: Gestion;
  ListInscripted: UserInfo[] | null;
  GroupGvG: UserGvG[] | null;
  NameGroupGvG: Record<string, string> | null;
  House: House[] | null;
  Statistique: Statistique;
  Forum: Post[] | null;
  Settingbot: SettingBot;
}
